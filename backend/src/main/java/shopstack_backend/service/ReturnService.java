package shopstack_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import shopstack_backend.dto.RefundResponseDTO;
import shopstack_backend.dto.ReturnRequestResponseDTO;
import shopstack_backend.entity.*;
import shopstack_backend.repository.OrderItemRepository;
import shopstack_backend.repository.ProductRepository;
import shopstack_backend.repository.RefundRepository;
import shopstack_backend.repository.ReturnRequestRepository;
import shopstack_backend.repository.StockAllocationRepository;
import shopstack_backend.repository.WarehouseStockRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReturnService {

    @Autowired
    private ReturnRequestRepository returnRequestRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private RefundRepository refundRepository;

    @Autowired
    private RefundService refundService;

    @Autowired
    private StockAllocationRepository stockAllocationRepository;

    @Autowired
    private WarehouseStockRepository warehouseStockRepository;

    @Autowired(required = false)
    private ProductService productService;

    @Autowired
    private OrderStatusService orderStatusService;

    @Autowired
    private CommissionService commissionService;

    // Customer requests a return — only allowed once an item has actually
    // been DELIVERED (before that, cancellation is the right tool), and
    // only one active request per item.
    @Transactional
    public ReturnRequestResponseDTO requestReturn(String customerEmail, Long orderItemId, String reason) {

        OrderItem item = orderItemRepository.findByIdAndOrder_User_Email(orderItemId, customerEmail)
                .orElseThrow(() -> new SecurityException(
                        "This order item doesn't exist or doesn't belong to your account."));

        if (item.getStatus() != OrderStatus.DELIVERED) {
            throw new IllegalStateException(
                    "Returns can only be requested for delivered items. " +
                    "This item is currently " + item.getStatus() + " — cancel it instead if it hasn't shipped yet.");
        }

        if (returnRequestRepository.existsByOrderItem_IdAndStatusIn(
                orderItemId, List.of(ReturnStatus.REQUESTED, ReturnStatus.QC_PENDING, ReturnStatus.COMPLETED))) {
            throw new IllegalStateException(
                    "A return request already exists for this item.");
        }

        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("Please provide a reason for the return.");
        }

        ReturnRequest request = new ReturnRequest();
        request.setOrderItem(item);
        request.setReason(reason);
        request.setStatus(ReturnStatus.REQUESTED);

        return mapToDTO(returnRequestRepository.save(request));
    }

    @Transactional(readOnly = true)
    public List<ReturnRequestResponseDTO> getMyReturnRequests(String customerEmail) {
        return returnRequestRepository
                .findByOrderItem_Order_User_EmailOrderByRequestedAtDesc(customerEmail)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // Only this vendor's own return requests — same isolation pattern as
    // vendor order items.
    @Transactional(readOnly = true)
    public List<ReturnRequestResponseDTO> getVendorReturnRequests(String vendorEmail) {
        return returnRequestRepository
                .findByOrderItem_Product_Vendor_User_EmailOrderByRequestedAtDesc(vendorEmail)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // Admin's global view — every return request across every vendor.
    @Transactional(readOnly = true)
    public List<ReturnRequestResponseDTO> getAllReturnRequests() {
        return returnRequestRepository.findAllByOrderByRequestedAtDesc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // Warehouse staff's QC inbox: returns approved by admin, physically
    // routed to their warehouse, and still awaiting inspection.
    @Transactional(readOnly = true)
    public List<ReturnRequestResponseDTO> getReturnsForWarehouseQC(Long warehouseId) {
        return returnRequestRepository
                .findByAssignedWarehouse_IdAndStatusOrderByRequestedAtAsc(warehouseId, ReturnStatus.QC_PENDING)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // Confirms a return request was actually routed to this warehouse
    // before letting its staff record a QC result on it. Called by
    // WarehouseStaffService, never exposed to the client directly.
    @Transactional(readOnly = true)
    public void assertWarehouseOwnsReturn(Long returnRequestId, Long warehouseId) {
        ReturnRequest request = returnRequestRepository.findById(returnRequestId)
                .orElseThrow(() -> new IllegalArgumentException("Return request not found."));
        if (request.getAssignedWarehouse() == null || warehouseId == null
                || !request.getAssignedWarehouse().getId().equals(warehouseId)) {
            throw new SecurityException("This return isn't assigned to your warehouse.");
        }
    }
    @Transactional
    public ReturnRequestResponseDTO approveReturn(Long returnRequestId, String resolutionNote) {

        ReturnRequest request = returnRequestRepository.findById(returnRequestId)
                .orElseThrow(() -> new IllegalArgumentException("Return request not found."));

        if (request.getStatus() != ReturnStatus.REQUESTED) {
            throw new IllegalStateException("This return request has already been " + request.getStatus() + ".");
        }

        OrderItem item = request.getOrderItem();
        Optional<Warehouse> fulfillingWarehouse = stockAllocationRepository
                .findByOrderItem_Id(item.getId())
                .stream()
                .filter(a -> a.getStatus() != AllocationStatus.CANCELLED)
                .map(StockAllocation::getWarehouse)
                .findFirst();

        request.setResolutionNote(resolutionNote);

        if (fulfillingWarehouse.isPresent()) {
            request.setStatus(ReturnStatus.QC_PENDING);
            request.setAssignedWarehouse(fulfillingWarehouse.get());
            request.setResolvedAt(LocalDateTime.now());
            returnRequestRepository.save(request);
            return mapToDTO(request);
        }
        return completeWithoutWarehouse(request, item);
    }

    private ReturnRequestResponseDTO completeWithoutWarehouse(ReturnRequest request, OrderItem item) {
        Product product = item.getProduct();
        if (product != null) {
            int currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
            product.setStockQuantity(currentStock + item.getQuantity());
            productRepository.save(product);
            if (productService != null) {
                productService.recordStockChange(product, currentStock, product.getStockQuantity(), "Return Approved (no warehouse on record)");
            }
        }
        finalizeReturn(request, item, "ACCEPTED");
        return mapToDTO(request);
    }

    @Transactional
    public ReturnRequestResponseDTO rejectReturn(Long returnRequestId, String resolutionNote) {

        ReturnRequest request = returnRequestRepository.findById(returnRequestId)
                .orElseThrow(() -> new IllegalArgumentException("Return request not found."));

        if (request.getStatus() != ReturnStatus.REQUESTED) {
            throw new IllegalStateException("This return request has already been " + request.getStatus() + ".");
        }

        request.setStatus(ReturnStatus.REJECTED);
        request.setResolvedAt(LocalDateTime.now());
        request.setResolutionNote(resolutionNote);

        return mapToDTO(returnRequestRepository.save(request));
    }

    // Warehouse staff's physical inspection of a returned item.
    // ACCEPTED  -> goods go back into sellable warehouse stock
    // DAMAGED   -> goods move to quarantine (damagedQuantity), never resold
    // Either way, the customer is refunded — QC determines what happens to
    // the physical inventory, not whether the customer already-approved
    // return gets paid out.
    @Transactional
    public ReturnRequestResponseDTO performQualityCheck(Long returnRequestId, String result, String qcNote) {

        ReturnRequest request = returnRequestRepository.findById(returnRequestId)
                .orElseThrow(() -> new IllegalArgumentException("Return request not found."));

        if (request.getStatus() != ReturnStatus.QC_PENDING) {
            throw new IllegalStateException(
                    "This return isn't awaiting QC (currently " + request.getStatus() + ").");
        }

        String normalizedResult = result == null ? "" : result.trim().toUpperCase();
        if (!normalizedResult.equals("ACCEPTED") && !normalizedResult.equals("DAMAGED")) {
            throw new IllegalArgumentException("QC result must be ACCEPTED or DAMAGED.");
        }

        OrderItem item = request.getOrderItem();
        Warehouse warehouse = request.getAssignedWarehouse();
        Product product = item.getProduct();

        if (warehouse != null && product != null) {
            WarehouseStock stock = warehouseStockRepository
                    .findByWarehouse_IdAndProduct_Id(warehouse.getId(), product.getId())
                    .orElseGet(() -> {
                        WarehouseStock s = new WarehouseStock();
                        s.setWarehouse(warehouse);
                        s.setProduct(product);
                        return s;
                    });
            if (normalizedResult.equals("ACCEPTED")) {
                stock.setAvailableQuantity(stock.getAvailableQuantity() + item.getQuantity());
            } else {
                stock.setDamagedQuantity(stock.getDamagedQuantity() + item.getQuantity());
            }
            warehouseStockRepository.save(stock);
        }

        request.setQcResult(normalizedResult);
        request.setQcNote(qcNote);
        request.setQcAt(LocalDateTime.now());

        finalizeReturn(request, item, normalizedResult);
        return mapToDTO(request);
    }

    // Shared tail end for both the QC path and the no-warehouse fallback:
    // mark the item RETURNED, process the refund, and close out the request.
    private void finalizeReturn(ReturnRequest request, OrderItem item, String qcResult) {
        item.setStatus(OrderStatus.RETURNED);
        orderItemRepository.save(item);

        Refund refund = refundService.processRefund(item);
        if (refund.getStatus() == RefundStatus.PROCESSED) {
            item.setStatus(OrderStatus.REFUNDED);
            orderItemRepository.save(item);
        }
        // If the refund FAILED (gateway error), the item stays RETURNED —
        // physically resolved, but payment not yet reversed. Visible via
        // the Refund record's own FAILED status for follow-up.

        request.setStatus(ReturnStatus.COMPLETED);
        request.setResolvedAt(request.getResolvedAt() != null ? request.getResolvedAt() : LocalDateTime.now());
        returnRequestRepository.save(request);

        // The item just left the normal PENDING→DELIVERED progression —
        // make sure the parent order's overall status reflects that too
        // (e.g. flips to REFUNDED once every item on it has been refunded),
        // instead of staying stuck on its last pre-return status.
        orderStatusService.recomputeOrderStatus(item.getOrder());

        // The vendor's commission on this specific item is no longer real
        // revenue — recalculate it now rather than leaving the commission
        // dashboard (and any "mark as paid" action) reflecting a sale that
        // was just refunded.
        commissionService.syncCommissionsForOrder(item.getOrder());
    }

    private ReturnRequestResponseDTO mapToDTO(ReturnRequest request) {
        ReturnRequestResponseDTO dto = new ReturnRequestResponseDTO();
        OrderItem item = request.getOrderItem();

        dto.setId(request.getId());
        dto.setOrderItemId(item.getId());
        dto.setOrderId(item.getOrder().getId());
        dto.setProductName(item.getProductName());
        dto.setLineTotal(item.getLineTotal());
        dto.setReason(request.getReason());
        dto.setStatus(request.getStatus().name());
        dto.setRequestedAt(request.getRequestedAt());
        dto.setResolvedAt(request.getResolvedAt());
        dto.setResolutionNote(request.getResolutionNote());
        if (request.getAssignedWarehouse() != null) {
            dto.setAssignedWarehouseId(request.getAssignedWarehouse().getId());
            dto.setAssignedWarehouseName(request.getAssignedWarehouse().getName());
        }
        dto.setQcResult(request.getQcResult());
        dto.setQcNote(request.getQcNote());
        dto.setQcAt(request.getQcAt());

        refundRepository.findByOrderItemId(item.getId()).ifPresent(refund -> {
            RefundResponseDTO refundDto = new RefundResponseDTO();
            refundDto.setAmount(refund.getAmount());
            refundDto.setMethod(refund.getMethod());
            refundDto.setStatus(refund.getStatus().name());
            refundDto.setGatewayRefundId(refund.getGatewayRefundId());
            refundDto.setProcessedAt(refund.getProcessedAt());
            refundDto.setFailureReason(refund.getFailureReason());
            dto.setRefund(refundDto);
        });

        return dto;
    }
}