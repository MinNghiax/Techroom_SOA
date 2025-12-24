package com.techroom.room_service.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "room_images")
@Data
public class RoomImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "image_url")
    private String imageUrl;

    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;
}