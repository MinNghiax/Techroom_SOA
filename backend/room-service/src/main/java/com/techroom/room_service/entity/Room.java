package com.techroom.room_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Table(name = "rooms")
@Data
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "building_id")
    private Building building;

    private String name;
    private Double price;
    private Double area;

    @Enumerated(EnumType.STRING)
    private RoomStatus status;
    private String tenantName;

    private String description;

    @OneToMany(mappedBy = "room")
    private List<RoomImage> images;

    @ManyToMany
    @JoinTable(
            name = "room_amenities",
            joinColumns = @JoinColumn(name = "room_id"),
            inverseJoinColumns = @JoinColumn(name = "amenity_id")
    )
    private List<Amenity> amenities;
}

