package com.smartcampus.facilities;

import com.smartcampus.facilities.dto.ResourceRequest;
import com.smartcampus.facilities.dto.ResourceResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/resources")
public class ResourceController {

        private final ResourceService resourceService;

        public ResourceController(ResourceService resourceService) {
                this.resourceService = resourceService;
        }

        @GetMapping
        @PreAuthorize("isAuthenticated()")
        public List<ResourceResponse> list() {
                return resourceService.findAll();
        }

        @GetMapping("/{id}")
        @PreAuthorize("isAuthenticated()")
        public ResourceResponse get(@PathVariable String id) {
                return resourceService.getById(id);
        }

        @PostMapping
        @PreAuthorize("hasRole('ADMIN')")
        @ResponseStatus(HttpStatus.CREATED)
        public ResourceResponse create(@Valid @RequestBody ResourceRequest request) {
                return resourceService.create(request);
        }

        @PatchMapping("/{id}")
        @PreAuthorize("hasRole('ADMIN')")
        public ResourceResponse update(@PathVariable String id, @Valid @RequestBody ResourceRequest request) {
                return resourceService.update(id, request);
        }

        @DeleteMapping("/{id}")
        @PreAuthorize("hasRole('ADMIN')")
        @ResponseStatus(HttpStatus.NO_CONTENT)
        public void delete(@PathVariable String id) {
                resourceService.delete(id);
        }
}
