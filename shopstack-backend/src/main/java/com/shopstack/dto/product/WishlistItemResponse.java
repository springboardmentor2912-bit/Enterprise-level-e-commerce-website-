package com.shopstack.dto.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistItemResponse {
    private Long id;
    private ProductResponse product;
    private LocalDateTime addedAt;
}
