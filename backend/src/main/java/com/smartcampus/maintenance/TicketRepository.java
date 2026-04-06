package com.smartcampus.maintenance;

import com.smartcampus.maintenance.model.Ticket;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TicketRepository extends MongoRepository<Ticket, String> {

	List<Ticket> findByUserIdOrderByCreatedAtDesc(String userId);
}
