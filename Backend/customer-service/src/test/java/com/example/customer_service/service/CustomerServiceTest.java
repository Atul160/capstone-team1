package com.example.customer_service.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.example.customer_service.exception.InvalidCustomerIdException;
import com.example.customer_service.model.Address;
import com.example.customer_service.model.Customer;
import com.example.customer_service.model.Name;
import com.example.customer_service.repository.CustomerRepository;

@ExtendWith(MockitoExtension.class)
public class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private CustomerService customerService;

    private Customer testCustomer;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(customerService, "SECRET_KEY", "yourSecretKey123");

        Name name = new Name("John", "Doe");
        Address address = new Address("123", "Main St", "City", "12345", "State", "Country");
        testCustomer = new Customer(null, "johndoe", "Password@123", name,
                LocalDate.of(1990, 1, 1), Customer.Sex.MALE, "john@example.com",
                12345, address, true, null, false, true, null, null, null, null, null, null, null);
    }

    @Test
    void registerCustomer_Success() throws Exception {
        when(customerRepository.existsByUsername(anyString())).thenReturn(false);
        when(customerRepository.existsByCustomerId(anyInt())).thenReturn(false);
        when(customerRepository.existsByEmail(anyString())).thenReturn(false);
        when(customerRepository.save(any(Customer.class))).thenReturn(testCustomer);

        String result = customerService.registerCustomer(testCustomer);
        assertEquals("Customer Registered Successfully, please validate your credit card on first login", result);
        verify(customerRepository).save(any(Customer.class));
    }

    @Test
    void registerCustomer_UsernameTaken() throws Exception {
        when(customerRepository.existsByUsername("johndoe")).thenReturn(true);

        String result = customerService.registerCustomer(testCustomer);
        assertEquals("Please validate the data: username already exists", result);
        verify(customerRepository, never()).save(any(Customer.class));
    }

    @Test
    void registerCustomer_EmailTaken() throws Exception {
        when(customerRepository.existsByUsername(anyString())).thenReturn(false);
        when(customerRepository.existsByEmail("john@example.com")).thenReturn(true);

        String result = customerService.registerCustomer(testCustomer);
        assertEquals("Please validate the data: Email already exists", result);
        verify(customerRepository, never()).save(any(Customer.class));
    }

    @Test
    void registerCustomer_InvalidAge() throws Exception {
        testCustomer = new Customer(null, "johndoe", "Password@123",
                new Name("John", "Doe"),
                LocalDate.now().minusYears(17), // Age less than 18
                Customer.Sex.MALE, "john@example.com",
                12345, new Address("123", "Main St", "City", "12345", "State", "Country"),
                true, null, false, true, null, null, null, null, null, null, null);

        String result = customerService.registerCustomer(testCustomer);
        assertEquals("Please validate the data: Customer must be at least 18 years old", result);
        verify(customerRepository, never()).save(any(Customer.class));
    }

    @Test
    void getCustomerById_NotFound() {
        when(customerRepository.findByCustomerId(99999)).thenReturn(Optional.empty());

        assertThrows(InvalidCustomerIdException.class, () -> {
            customerService.getCustomerById(99999);
        });
    }

    @Test
    void updateCustomerAddress_Success() {
        when(customerRepository.findByUsername("johndoe")).thenReturn(Optional.of(testCustomer));
        when(customerRepository.save(any(Customer.class))).thenReturn(testCustomer);

        Address newAddress = new Address("456", "New St", "NewCity", "67890", "NewState", "NewCountry");
        boolean result = customerService.updateCustomerAddress("johndoe", newAddress);

        assertTrue(result);
        verify(customerRepository).save(any(Customer.class));
    }

    @Test
    void updateCustomerAddress_CustomerNotFound() {
        when(customerRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        Address newAddress = new Address("456", "New St", "NewCity", "67890", "NewState", "NewCountry");
        boolean result = customerService.updateCustomerAddress("nonexistent", newAddress);

        assertFalse(result);
        verify(customerRepository, never()).save(any(Customer.class));
    }

    @Test
    void updateEmail_Success() {
        when(customerRepository.findByUsername("johndoe")).thenReturn(Optional.of(testCustomer));
        when(customerRepository.save(any(Customer.class))).thenReturn(testCustomer);

        assertDoesNotThrow(() -> {
            customerService.updateEmail("johndoe", "newemail@example.com");
        });
        verify(customerRepository).save(any(Customer.class));
    }

    @Test
    void updateEmail_CustomerNotFound() {
        when(customerRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> {
            customerService.updateEmail("nonexistent", "newemail@example.com");
        });
        verify(customerRepository, never()).save(any(Customer.class));
    }

    @Test
    void updateEmail_InvalidEmail() {
        when(customerRepository.findByUsername("johndoe")).thenReturn(Optional.of(testCustomer));

        assertThrows(RuntimeException.class, () -> {
            customerService.updateEmail("johndoe", "invalid-email");
        });
        verify(customerRepository, never()).save(any(Customer.class));
    }
}