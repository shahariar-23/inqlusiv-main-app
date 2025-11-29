package com.inqlusiv.mainapp.modules.auth.repository;

import com.inqlusiv.mainapp.modules.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
}
