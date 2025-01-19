package com.example.transaction_service.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.transaction_service.model.CreditCardInfo;
import com.example.transaction_service.model.Transaction;
import com.example.transaction_service.model.TransactionInfo;
import com.example.transaction_service.repository.TransactionRepository;

import jakarta.validation.ValidationException;

@ExtendWith(MockitoExtension.class)
public class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private TransactionService transactionService;

    private Transaction testTransaction;
    private TransactionInfo testTransactionInfo;
    private CreditCardInfo testCreditCardInfo;

    @BeforeEach
    void setUp() {
        testTransactionInfo = new TransactionInfo(123456L, "2024-01-19", "10:30:00", "CR", 100.00);
        TransactionInfo[] transactions = {testTransactionInfo};
        testCreditCardInfo = new CreditCardInfo(12345, transactions);
        CreditCardInfo[] creditCards = {testCreditCardInfo};
        testTransaction = new Transaction(null, "johndoe", creditCards);
    }

    @Test
    void getTransactionsByType_Success() {
        when(transactionRepository.findAll()).thenReturn(Arrays.asList(testTransaction));

        List<TransactionInfo> result = transactionService.getTransactionsByType("CR");

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        assertEquals("CR", result.get(0).getTransactionType());
        assertEquals(100.00, result.get(0).getTransactionAmount());
    }

    @Test
    void getTransactionsByType_NoMatchingTransactions() {
        when(transactionRepository.findAll()).thenReturn(Arrays.asList(testTransaction));

        List<TransactionInfo> result = transactionService.getTransactionsByType("DB");

        assertTrue(result.isEmpty());
    }

    @Test
    void findTransactionsByTypeAndCard_Success() {
        when(transactionRepository.findAll()).thenReturn(Arrays.asList(testTransaction));

        List<TransactionInfo> result = transactionService.findTransactionsByTypeAndCard("CR", 12345);

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        assertEquals("CR", result.get(0).getTransactionType());
        assertEquals(100.00, result.get(0).getTransactionAmount());
    }

    @Test
    void findTransactionsByTypeAndCard_NoMatchingTransactions() {
        when(transactionRepository.findAll()).thenReturn(Arrays.asList(testTransaction));

        List<TransactionInfo> result = transactionService.findTransactionsByTypeAndCard("DB", 12345);

        assertTrue(result.isEmpty());
    }

    @Test
    void findTransactionsByTypeAndCard_NoMatchingCard() {
        when(transactionRepository.findAll()).thenReturn(Arrays.asList(testTransaction));

        List<TransactionInfo> result = transactionService.findTransactionsByTypeAndCard("CR", 99999);

        assertTrue(result.isEmpty());
    }

    @Test
    void saveTransaction_Success() {
        when(transactionRepository.save(any(Transaction.class))).thenReturn(testTransaction);

        assertDoesNotThrow(() -> {
            transactionService.saveTransaction(testTransaction);
        });

        verify(transactionRepository).save(testTransaction);
    }

    @Test
    void saveTransaction_NullCreditCards() {
        testTransaction.setCreditcards(null);

        assertThrows(ValidationException.class, () -> {
            transactionService.saveTransaction(testTransaction);
        });

        verify(transactionRepository, never()).save(any());
    }

    @Test
    void saveTransaction_EmptyCreditCards() {
        testTransaction.setCreditcards(new CreditCardInfo[0]);

        assertThrows(ValidationException.class, () -> {
            transactionService.saveTransaction(testTransaction);
        });

        verify(transactionRepository, never()).save(any());
    }
}