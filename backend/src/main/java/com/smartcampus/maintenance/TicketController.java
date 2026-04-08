package com.smartcampus.maintenance;

import com.smartcampus.maintenance.dto.TicketAssignmentRequest;
import com.smartcampus.maintenance.dto.TicketCommentRequest;
import com.smartcampus.maintenance.dto.TicketRequest;
import com.smartcampus.maintenance.dto.TicketResponse;
import com.smartcampus.maintenance.dto.TicketStatusPatchRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
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
	public List<TicketResponse> list(@RequestParam(required = false) String userId) {
		return ticketService.list(userId);
	}

	@GetMapping("/{id}")
	public TicketResponse get(@PathVariable String id) {
		return ticketService.getById(id);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public TicketResponse create(@Valid @RequestBody TicketRequest request) {
		return ticketService.create(request);
	}

	@PutMapping("/{id}")
	public TicketResponse update(
			@PathVariable String id,
			@Valid @RequestBody TicketRequest request,
			@RequestParam String userId,
			@RequestParam(required = false, defaultValue = "false") boolean isAdmin) {
		return ticketService.updateTicket(id, request, userId, isAdmin);
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(
			@PathVariable String id,
			@RequestParam String userId,
			@RequestParam(required = false, defaultValue = "false") boolean isAdmin) {
		ticketService.deleteTicket(id, userId, isAdmin);
	}

	@PatchMapping("/{id}/status")
	public TicketResponse patchStatus(
			@PathVariable String id, 
			@Valid @RequestBody TicketStatusPatchRequest body,
			@RequestParam(required = false, defaultValue = "false") boolean isAdmin) {
		return ticketService.patchStatus(id, body, isAdmin);
	}

	@PutMapping("/{id}/assign")
	public TicketResponse assignTechnician(
			@PathVariable String id, 
			@Valid @RequestBody TicketAssignmentRequest body,
			@RequestParam(required = false, defaultValue = "false") boolean isAdmin) {
		return ticketService.assignTechnician(id, body, isAdmin);
	}

	@PostMapping("/{id}/comments")
	@ResponseStatus(HttpStatus.CREATED)
	public TicketResponse addComment(
			@PathVariable String id, @Valid @RequestBody TicketCommentRequest body) {
		return ticketService.addComment(id, body);
	}

	@PutMapping("/{id}/comments/{commentId}")
	public TicketResponse updateComment(
			@PathVariable String id,
			@PathVariable String commentId,
			@Valid @RequestBody TicketCommentRequest body,
			@RequestParam(required = false, defaultValue = "false") boolean isAdmin) {
		return ticketService.updateComment(id, commentId, body, isAdmin);
	}

	@DeleteMapping("/{id}/comments/{commentId}")
	public TicketResponse deleteComment(
			@PathVariable String id,
			@PathVariable String commentId,
			@RequestParam String userId,
			@RequestParam(required = false, defaultValue = "false") boolean isAdmin) {
		return ticketService.deleteComment(id, commentId, userId, isAdmin);
	}
}
