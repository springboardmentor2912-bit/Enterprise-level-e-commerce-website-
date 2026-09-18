package com.shopstack.service;

import com.shopstack.dto.WishlistItemDTO;
import java.util.List;

public interface WishlistService {
    WishlistItemDTO addToWishlist(String customerEmail, Long productId);
    void removeFromWishlist(String customerEmail, Long productId);
    List<WishlistItemDTO> getCustomerWishlist(String customerEmail);
}
