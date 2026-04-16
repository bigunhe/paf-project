package com.smartcampus.maintenance;

import com.smartcampus.core.exception.ResourceNotFoundException;
import com.smartcampus.facilities.ResourceService;
import com.smartcampus.maintenance.dto.TicketAssignmentPatchRequest;
import com.smartcampus.maintenance.dto.TicketCommentRequest;
import com.smartcampus.maintenance.dto.TicketRequest;
import com.smartcampus.maintenance.dto.TicketResponse;
import com.smartcampus.maintenance.dto.TicketStatusPatchRequest;
import com.smartcampus.maintenance.model.Ticket;
import com.smartcampus.maintenance.model.TicketComment;
import com.smartcampus.maintenance.model.TicketStatus;
import com.smartcampus.notifications.NotificationService;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;

@Service
public class TicketService {

	private static final int MAX_IMAGES = 3;

	private final TicketRepository ticketRepository;
	private final ResourceService resourceService;
	private final NotificationService notificationService;

	public TicketService(
			TicketRepository ticketRepository,
			ResourceService resourceService,
			NotificationService notificationService) {
		this.ticketRepository = ticketRepository;
		this.resourceService = resourceService;
		this.notificationService = notificationService;
	}

	public List<TicketResponse> list(String userId) {
		List<Ticket> list =
				userId == null || userId.isBlank()
						? ticketRepository.findAll()
						: ticketRepository.findByUserIdOrderByCreatedAtDesc(userId);
		return list.stream().map(this::toResponse).toList();
	}

	public TicketResponse getById(String id) {
		return ticketRepository.findById(id).map(this::toResponse)
				.orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + id));
	}

	public TicketResponse create(TicketRequest req) {
		resourceService.getEntityById(req.resourceId());
		List<String> images =
				req.imageAttachments() != null ? new ArrayList<>(req.imageAttachments()) : new ArrayList<>();
		if (images.size() > MAX_IMAGES) {
			throw new IllegalArgumentException("At most " + MAX_IMAGES + " image attachments allowed");
		}

		Ticket t = Ticket.builder()
				.resourceId(req.resourceId())
				.userId(req.userId())
				.category(req.category())
				.description(req.description())
				.priority(req.priority())
				.status(TicketStatus.OPEN)
				.contactDetails(req.contactDetails())
				.imageAttachments(images)
				.resolutionNotes(null)
				.technicianAssigned(null)
				.comments(new ArrayList<>())
				.createdAt(LocalDateTime.now())
				.build();
		return toResponse(ticketRepository.save(t));
	}

	public TicketResponse patchStatus(String id, TicketStatusPatchRequest patch) {
		Ticket t = ticketRepository
				.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + id));
		TicketStatus previous = t.getStatus();
		t.setStatus(patch.status());
		Ticket saved = ticketRepository.save(t);
		if (previous != patch.status()) {
			notificationService.create(
					t.getUserId(),
					NotificationService.TYPE_TICKET_UPDATE,
					"Ticket \"" + t.getCategory() + "\" status changed from "
							+ previous + " to " + patch.status() + ".");
		}
		return toResponse(saved);
	}

	public TicketResponse patchAssignment(String id, TicketAssignmentPatchRequest patch) {
		Ticket t = ticketRepository
				.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + id));
		t.setTechnicianAssigned(patch.technicianAssigned());
		return toResponse(ticketRepository.save(t));
	}

	public TicketResponse addComment(String id, TicketCommentRequest req) {
		Ticket t = ticketRepository
				.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + id));
		TicketComment c = TicketComment.builder()
				.commentId(new ObjectId().toHexString())
				.userId(req.userId())
				.content(req.content())
				.createdAt(LocalDateTime.now())
				.build();
		if (t.getComments() == null) {
			t.setComments(new ArrayList<>());
		}
		t.getComments().add(c);
		return toResponse(ticketRepository.save(t));
	}

	private TicketResponse toResponse(Ticket t) {
		return new TicketResponse(
				t.getId(),
				t.getResourceId(),
				t.getUserId(),
				t.getCategory(),
				t.getDescription(),
				t.getPriority(),
				t.getStatus(),
				t.getContactDetails(),
				t.getImageAttachments() != null ? t.getImageAttachments() : List.of(),
				t.getResolutionNotes(),
				t.getTechnicianAssigned(),
				t.getComments() != null ? t.getComments() : List.of(),
				t.getCreatedAt());
	}
}
