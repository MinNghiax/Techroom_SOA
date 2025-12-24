package com.techroom.room_service.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "buildings")
@Data
public class Building {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private Integer landlordId; // ID từ auth_db
    private String name;
    private String address;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne
    @JoinColumn(name = "province_code")
    private Province province;

    @ManyToOne
    @JoinColumn(name = "district_code")
    private District district;
}