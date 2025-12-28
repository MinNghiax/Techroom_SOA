package com.example.demo.repository;


import com.example.demo.entity.Contract;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ContractRepository extends JpaRepository<Contract, Integer> {

    List<Contract> findByTenantId(Integer tenantId);

    List<Contract> findByLandlordId(Integer landlordId);

    Optional<Contract> findByIdAndLandlordId(Integer id, Integer landlordId);
}

