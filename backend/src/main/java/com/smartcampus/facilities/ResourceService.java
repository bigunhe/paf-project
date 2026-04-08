package com.smartcampus.facilities;

import com.smartcampus.facilities.dto.ResourceRequest;
import com.smartcampus.facilities.dto.ResourceResponse;
import com.smartcampus.facilities.model.Resource;
import com.smartcampus.facilities.model.ResourceStatus;
import com.smartcampus.facilities.model.ResourceType;
import com.smartcampus.core.exception.ResourceNotFoundException;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;

@Service
public class ResourceService {

        private final ResourceRepository resourceRepository;

        public ResourceService(ResourceRepository resourceRepository) {
                this.resourceRepository = resourceRepository;
        }

        public List<ResourceResponse> findAll(ResourceType type, Integer minCapacity, String location,
                        ResourceStatus status, String search) {
                String normalizedLocation = location == null ? null : location.trim().toLowerCase(Locale.ROOT);
                String normalizedSearch = search == null ? null : search.trim().toLowerCase(Locale.ROOT);

                return resourceRepository.findAll().stream()
                                .filter(resource -> type == null || resource.getType() == type)
                                .filter(resource -> minCapacity == null || resource.getCapacity() >= minCapacity)
                                .filter(resource -> status == null || resource.getStatus() == status)
                                .filter(resource -> normalizedLocation == null || normalizedLocation.isBlank()
                                                || containsIgnoreCase(resource.getLocation(), normalizedLocation))
                                .filter(resource -> normalizedSearch == null || normalizedSearch.isBlank()
                                                || containsIgnoreCase(resource.getName(), normalizedSearch)
                                                || containsIgnoreCase(resource.getLocation(), normalizedSearch)
                                                || containsIgnoreCase(resource.getAvailabilityWindow(), normalizedSearch))
                                .map(this::toResponse)
                                .toList();
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
                                .availabilityWindow(req.availabilityWindow())
                                .status(req.status())
                                .build();
                return toResponse(resourceRepository.save(r));
        }

        public ResourceResponse update(String id, ResourceRequest req) {
                Resource existing = getEntityById(id);
                existing.setName(req.name());
                existing.setType(req.type());
                existing.setCapacity(req.capacity());
                existing.setLocation(req.location());
                existing.setAvailabilityWindow(req.availabilityWindow());
                existing.setStatus(req.status());
                return toResponse(resourceRepository.save(existing));
        }

        public void delete(String id) {
                if (!resourceRepository.existsById(id)) {
                        throw new ResourceNotFoundException("Resource not found: " + id);
                }
                resourceRepository.deleteById(id);
        }

        private ResourceResponse toResponse(Resource r) {
                return new ResourceResponse(
                                r.getId(), r.getName(), r.getType(), r.getCapacity(), r.getLocation(),
                                r.getAvailabilityWindow(), r.getStatus());
        }

        private boolean containsIgnoreCase(String value, String fragment) {
                return value != null && value.toLowerCase(Locale.ROOT).contains(fragment);
        }
}
