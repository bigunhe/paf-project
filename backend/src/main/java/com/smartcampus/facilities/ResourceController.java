package com.smartcampus.facilities;

import com.smartcampus.facilities.dto.ResourceRequest;
import com.smartcampus.facilities.dto.ResourceResponse;
import com.smartcampus.facilities.model.ResourceStatus;
import com.smartcampus.facilities.model.ResourceType;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
        public List<ResourceResponse> list(@RequestParam(required = false) ResourceType type,
                        @RequestParam(required = false) Integer minCapacity,
                        @RequestParam(required = false) String location,
                        @RequestParam(required = false) ResourceStatus status,
                        @RequestParam(required = false) String search) {
                return resourceService.findAll(type, minCapacity, location, status, search);
        }

        @GetMapping("/{id}")
        public ResourceResponse get(@PathVariable String id) {
                return resourceService.getById(id);
        }

        @PostMapping
        @ResponseStatus(HttpStatus.CREATED)
        public ResourceResponse create(@Valid @RequestBody ResourceRequest request) {
                return resourceService.create(request);
        }

        @PutMapping("/{id}")
        public ResourceResponse update(@PathVariable String id, @Valid @RequestBody ResourceRequest request) {
                return resourceService.update(id, request);
        }

        @DeleteMapping("/{id}")
        @ResponseStatus(HttpStatus.NO_CONTENT)
        public void delete(@PathVariable String id) {
                resourceService.delete(id);
        }
}
