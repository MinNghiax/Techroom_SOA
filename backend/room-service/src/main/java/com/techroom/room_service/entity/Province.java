package com.techroom.room_service.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "provinces")
@Data
public class Province {
    @Id
    private Integer code;
    private String name;
    @Column(name = "division_type")
    private String divisionType;
}