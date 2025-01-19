package com.example.customer_service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
		"spring.data.mongodb.uri=mongodb://localhost:27017/testdb",
		"eureka.client.enabled=false",
		"spring.cloud.discovery.enabled=false"
})
class CustomerServiceApplicationTests {

	@Test
	void contextLoads() {
	}
}