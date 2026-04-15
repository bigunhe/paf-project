package com.smartcampus.maintenance;

import com.smartcampus.auth.model.RoleType;
import com.smartcampus.auth.security.JwtPrincipal;
import com.smartcampus.maintenance.dto.TicketAssignmentPatchRequest;
import com.smartcampus.maintenance.dto.TicketCommentRequest;
import com.smartcampus.maintenance.dto.TicketRequest;
import com.smartcampus.maintenance.dto.TicketResponse;
import com.smartcampus.maintenance.dto.TicketStatusPatchRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/tickets")
public class TicketController {

	private final TicketService ticketService;

	public TicketController(TicketService ticketService) {
		this.ticketService = ticketService;
	}

	@GetMapping
	@PreAuthorize("isAuthenticated()")
	public List<TicketResponse> list(
			@RequestParam(required = false) String userId, @AuthenticationPrincipal JwtPrincipal principal) {
		if (principal.getRole() != RoleType.ADMIN) {
			userId = principal.getUserId();
		}
		return ticketService.list(userId);
	}

	@GetMapping("/{id}")
	@PreAuthorize("isAuthenticated()")
	public TicketResponse get(@PathVariable String id) {
		return ticketService.getById(id);
	}

	@PostMapping
	@PreAuthorize("isAuthenticated()")
	@ResponseStatus(HttpStatus.CREATED)
	public TicketResponse create(@Valid @RequestBody TicketRequest request) {
		return ticketService.create(request);
	}

	@PatchMapping("/{id}/status")
	@PreAuthorize("hasRole('ADMIN')")
	public TicketResponse patchStatus(
			@PathVariable String id, @Valid @RequestBody TicketStatusPatchRequest body) {
		return ticketService.patchStatus(id, body);
	}

	@PatchMapping("/{id}/assignment")
	@PreAuthorize("hasRole('ADMIN')")
	public TicketResponse patchAssignment(
			@PathVariable String id, @Valid @RequestBody TicketAssignmentPatchRequest body) {
		return ticketService.patchAssignment(id, body);
	}

	@PostMapping("/{id}/comments")
	@PreAuthorize("isAuthenticated()")
	@ResponseStatus(HttpStatus.CREATED)
	public TicketResponse addComment(
			@PathVariable String id, @Valid @RequestBody TicketCommentRequest body) {
		return ticketService.addComment(id, body);
	}
}
