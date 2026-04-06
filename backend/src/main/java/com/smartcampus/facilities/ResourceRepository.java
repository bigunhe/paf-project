package com.smartcampus.facilities;

import com.smartcampus.facilities.model.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ResourceRepository extends MongoRepository<Resource, String> {
}
