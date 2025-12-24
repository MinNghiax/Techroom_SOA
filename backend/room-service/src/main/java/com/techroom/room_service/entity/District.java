package com.techroom.room_service.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "districts")
@Data
public class District {
    @Id
    private Integer code;
    private String name;

    @ManyToOne
    @JoinColumn(name = "province_code")
    private Province province;

    @Column(name = "division_type")
    private String divisionType;
}
