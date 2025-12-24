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
}
