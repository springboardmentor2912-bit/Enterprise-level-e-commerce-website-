package com.shopstack.service;

import com.shopstack.dto.*;

import java.util.List;

public interface ReturnService {

    // ─── Customer Operations ───────────────────────────────────────────────

    /** Submit a return request for a specific order item */
    ReturnRequestDTO requestReturn(String customerEmail, Long orderItemId, CreateReturnRequestDto request);

    /** Get all return requests for the logged-in customer */
    List<ReturnRequestDTO> getMyReturns(String customerEmail);

    /** Get return status for a specific order item (for order detail view) */
    ReturnRequestDTO getReturnStatusForOrderItem(String customerEmail, Long orderItemId);

    // ─── Admin Operations ──────────────────────────────────────────────────

    /** Get all return requests (admin view) */
    List<ReturnRequestDTO> getAllReturnRequests();

    /** Get a specific return request by ID (admin view) */
    ReturnRequestDTO getReturnRequestById(Long returnId);

    /** Approve or reject a return request */
    ReturnRequestDTO reviewReturn(Long returnId, AdminReturnActionRequest request);

    /** Mark the returned product as received; optionally restock inventory */
    ReturnRequestDTO receiveReturn(Long returnId, AdminReceiveReturnRequest request);

    /** Initiate the actual Razorpay refund for an accepted return */
    ReturnRequestDTO initiateRefund(Long returnId);
}
