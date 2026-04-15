package com.smartcampus.facilities;

import com.smartcampus.facilities.dto.ResourceRequest;
import com.smartcampus.facilities.dto.ResourceResponse;
import com.smartcampus.facilities.model.Resource;
import com.smartcampus.core.exception.ResourceNotFoundException;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ResourceService {

        private final ResourceRepository resourceRepository;

        public ResourceService(ResourceRepository resourceRepository) {
                this.resourceRepository = resourceRepository;
        }

        public List<ResourceResponse> findAll() {
                return resourceRepository.findAll().stream().map(this::toResponse).toList();
        }

        public ResourceResponse getById(String id) {
                return resourceRepository.findById(id).map(this::toResponse)
                                .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + id));
        }

        public Resource getEntityById(String id) {
                return resourceRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + id));
        }

        public ResourceResponse create(ResourceRequest req) {
                Resource r = Resource.builder()
                                .name(req.name())
                                .type(req.type())
                                .capacity(req.capacity())
                                .location(req.location())
                                .status(req.status())
                                .build();
                return toResponse(resourceRepository.save(r));
        }

        public ResourceResponse update(String id, ResourceRequest req) {
                Resource r = resourceRepository
                                .findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + id));
                r.setName(req.name());
                r.setType(req.type());
                r.setCapacity(req.capacity());
                r.setLocation(req.location());
                r.setStatus(req.status());
                return toResponse(resourceRepository.save(r));
        }

        public void delete(String id) {
                if (!resourceRepository.existsById(id)) {
                        throw new ResourceNotFoundException("Resource not found: " + id);
                }
                resourceRepository.deleteById(id);
        }

        private ResourceResponse toResponse(Resource r) {
                return new ResourceResponse(
                                r.getId(), r.getName(), r.getType(), r.getCapacity(), r.getLocation(), r.getStatus());
        }
}
