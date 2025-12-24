package com.techroom.room_service.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "amenities")
@Data
public class Amenity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String name;
    private String icon;
    private String description;
}
