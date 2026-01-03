package com.example.demo.service;


import com.example.demo.dto.BookingDTO;
import com.example.demo.entity.Contract;
import com.example.demo.entity.ContractStatus;
import com.example.demo.repository.ContractRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BookingService {

    private final ContractRepository contractRepository;

    public Contract createBooking(BookingDTO dto, Integer tenantId) {

        Contract contract = new Contract();
        contract.setContractCode("HD" + System.currentTimeMillis());

        contract.setRoomId(dto.getRoomId());
        contract.setTenantId(tenantId);
        contract.setLandlordId(dto.getLandlordId());

        contract.setFullName(dto.getFullName());
        contract.setCccd(dto.getCccd());
        contract.setPhone(dto.getPhone());
        contract.setAddress(dto.getAddress());

        contract.setStartDate(dto.getStartDate());
        contract.setEndDate(dto.getEndDate());
        contract.setDeposit(dto.getDeposit());
        contract.setMonthlyRent(dto.getMonthlyRent());
        contract.setNotes(dto.getNotes());

        contract.setStatus(ContractStatus.PENDING);
        contract.setCreatedAt(LocalDateTime.now());
        contract.setUpdatedAt(LocalDateTime.now());

        return contractRepository.save(contract);
    }

    public List<Contract> getTenantContracts(Integer tenantId) {
        return contractRepository.findByTenantId(tenantId);
    }

    public Contract approve(Integer contractId, Integer landlordId) {
        Contract c = contractRepository
                .findByIdAndLandlordId(contractId, landlordId)
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        c.setStatus(ContractStatus.APPROVED);
        c.setUpdatedAt(LocalDateTime.now());
        return contractRepository.save(c);
    }

    public Contract reject(Integer contractId, Integer landlordId, String reason) {
        Contract c = contractRepository
                .findByIdAndLandlordId(contractId, landlordId)
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        c.setStatus(ContractStatus.REJECTED);
        c.setRejectionReason(reason);
        c.setUpdatedAt(LocalDateTime.now());
        return contractRepository.save(c);
    }
    // BookingService.java
    public List<Contract> getLandlordContracts(Integer landlordId) {
        return contractRepository.findByLandlordId(landlordId);
    }

    // Chấm dứt hợp đồng (Chuyển sang CANCELLED)
    public Contract terminate(Integer contractId, Integer landlordId) {
        Contract c = contractRepository
                .findByIdAndLandlordId(contractId, landlordId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hợp đồng"));

        // Chỉ cho phép hủy nếu đang ở trạng thái hoạt động
        if (c.getStatus() == ContractStatus.ACTIVE || c.getStatus() == ContractStatus.APPROVED) {
            c.setStatus(ContractStatus.CANCELLED);
            c.setUpdatedAt(LocalDateTime.now());
            return contractRepository.save(c);
        } else {
            throw new RuntimeException("Trạng thái hiện tại không thể hủy: " + c.getStatus());
        }
    }

    // Xóa hợp đồng khỏi Database
    public void deleteContract(Integer contractId, Integer landlordId) {
        Contract c = contractRepository
                .findByIdAndLandlordId(contractId, landlordId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hợp đồng"));

        // Chỉ cho phép xóa các hợp đồng không còn hiệu lực để tránh mất dữ liệu quan trọng
        if (c.getStatus() == ContractStatus.REJECTED ||
                c.getStatus() == ContractStatus.CANCELLED ||
                c.getStatus() == ContractStatus.EXPIRED ||
                c.getStatus() == ContractStatus.PENDING) {
            contractRepository.delete(c);
        } else {
            throw new RuntimeException("Không thể xóa hợp đồng đang có hiệu lực (ACTIVE/APPROVED)");
        }
    }
}
