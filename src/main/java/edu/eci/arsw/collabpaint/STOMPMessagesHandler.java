package edu.eci.arsw.collabpaint;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import edu.eci.arsw.collabpaint.model.Point;
import edu.eci.arsw.collabpaint.model.Polygon;

@Controller
public class STOMPMessagesHandler {

	@Autowired
	SimpMessagingTemplate msgt;

	private Map<String, List<Point>> pointsMap = new ConcurrentHashMap<>();

	@MessageMapping("/newpoint.{numdibujo}")
	public void handlePointEvent(Point pt, @DestinationVariable String numdibujo) throws Exception {
		System.out.println("Nuevo punto recibido en el servidor!:" + pt);

		// Almacenar el punto en la lista correspondiente al numdibujo
		pointsMap.computeIfAbsent(numdibujo, k -> new ArrayList<>()).add(pt);

		List<Point> points = pointsMap.get(numdibujo);

		if (points.size() >= 4) {

			Polygon polygon = new Polygon(points);
			msgt.convertAndSend("/topic/newpolygon." + numdibujo, polygon);
		}

		msgt.convertAndSend("/topic/newpoint." + numdibujo, pt);
	}

	// @MessageMapping("/newpolygon.{numdibujo}")
	// public void handlePolygonEvent(Polygon polygon, @DestinationVariable String
	// numdibujo) throws Exception {
	// System.out.println("Nuevo poligono recibido en el servidor!:" + polygon);
	// msgt.convertAndSend("/topic/newpolygon." + numdibujo, polygon);
	// }
}
