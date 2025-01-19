package com.example.transaction_service.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.example.transaction_service.model.CreditCardInfo;
import com.example.transaction_service.model.Transaction;
import com.example.transaction_service.model.TransactionInfo;
import com.example.transaction_service.service.TransactionService;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
public class TransactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TransactionService transactionService;

    @Autowired
    private ObjectMapper objectMapper;

    private Transaction testTransaction;
    private TransactionInfo testTransactionInfo;
    private CreditCardInfo testCreditCardInfo;

    @BeforeEach
    void setUp() {
        // Create test TransactionInfo
        testTransactionInfo = new TransactionInfo(123456L, "2024-01-19", "10:30:00", "CR", 100.00);

        // Create test CreditCardInfo
        TransactionInfo[] transactions = {testTransactionInfo};
        testCreditCardInfo = new CreditCardInfo(12345, transactions);

        // Create test Transaction
        CreditCardInfo[] creditCards = {testCreditCardInfo};
        testTransaction = new Transaction(null, "johndoe", creditCards);
    }

    @Test
    void getTransactionsByType_Success() throws Exception {
        List<TransactionInfo> transactions = Arrays.asList(testTransactionInfo);
        when(transactionService.getTransactionsByType("CR")).thenReturn(transactions);

        mockMvc.perform(get("/api/transaction/CR"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].transactionType").value("CR"))
                .andExpect(jsonPath("$[0].transactionAmount").value(100.00))
                .andExpect(jsonPath("$[0].transactionDate").value("2024-01-19"));
    }

    @Test
    void getTransactionsByType_EmptyResult() throws Exception {
        when(transactionService.getTransactionsByType("DB")).thenReturn(Arrays.asList());

        mockMvc.perform(get("/api/transaction/DB"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void getTransactionsByTypeAndCard_Success() throws Exception {
        List<TransactionInfo> transactions = Arrays.asList(testTransactionInfo);
        when(transactionService.findTransactionsByTypeAndCard("CR", 12345)).thenReturn(transactions);

        mockMvc.perform(get("/api/transaction")
                        .param("transactionType", "CR")
                        .param("creditCardId", "12345"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].transactionType").value("CR"))
                .andExpect(jsonPath("$[0].transactionAmount").value(100.00));
    }

    @Test
    void getTransactionsByTypeAndCard_NoTransactions() throws Exception {
        when(transactionService.findTransactionsByTypeAndCard("DB", 12345)).thenReturn(Arrays.asList());

        mockMvc.perform(get("/api/transaction")
                        .param("transactionType", "DB")
                        .param("creditCardId", "12345"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void addTransaction_Success() throws Exception {
        mockMvc.perform(post("/api/transaction/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testTransaction)))
                .andExpect(status().isOk())
                .andExpect(content().string("Transaction saved successfully"));
    }
}