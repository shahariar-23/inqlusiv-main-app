package com.inqlusiv.mainapp.modules.company.service;

import com.inqlusiv.mainapp.modules.company.entity.Company;
import org.springframework.web.multipart.MultipartFile;

public interface CsvService {
    void saveEmployees(MultipartFile file, Company company);
}
