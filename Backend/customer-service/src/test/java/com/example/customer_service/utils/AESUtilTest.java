package com.example.customer_service.utils;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

public class AESUtilTest {

    private static final String SECRET_KEY = "testSecretKey123";

    @Test
    void encrypt_DecryptSuccess() throws Exception {
        String originalText = "testPassword123";

        String encrypted = AESUtil.encrypt(originalText, SECRET_KEY);
        assertNotNull(encrypted);
        assertNotEquals(originalText, encrypted);

        String decrypted = AESUtil.decrypt(encrypted, SECRET_KEY);
        assertEquals(originalText, decrypted);
    }

    @Test
    void encrypt_DifferentTexts_ProduceDifferentEncryptions() throws Exception {
        String text1 = "password1";
        String text2 = "password2";

        String encrypted1 = AESUtil.encrypt(text1, SECRET_KEY);
        String encrypted2 = AESUtil.encrypt(text2, SECRET_KEY);

        assertNotEquals(encrypted1, encrypted2);
    }

    @Test
    void encrypt_SameText_DifferentKeys_ProduceDifferentEncryptions() throws Exception {
        String text = "password123";
        String key1 = "secretKey1234567";
        String key2 = "differentKey1234";

        String encrypted1 = AESUtil.encrypt(text, key1);
        String encrypted2 = AESUtil.encrypt(text, key2);

        assertNotEquals(encrypted1, encrypted2);
    }

    @Test
    void decrypt_WrongKey_ThrowsException() {
        String originalText = "testPassword123";
        assertThrows(Exception.class, () -> {
            String encrypted = AESUtil.encrypt(originalText, SECRET_KEY);
            AESUtil.decrypt(encrypted, "wrongKey1234567");
        });
    }

    @Test
    void encrypt_ShortKey_PadsCorrectly() throws Exception {
        String shortKey = "short";
        String text = "testPassword";

        String encrypted = AESUtil.encrypt(text, shortKey);
        String decrypted = AESUtil.decrypt(encrypted, shortKey);

        assertEquals(text, decrypted);
    }

    @Test
    void encrypt_LongKey_TruncatesCorrectly() throws Exception {
        String longKey = "thisIsAVeryLongKeyThatShouldBeTruncated";
        String text = "testPassword";

        String encrypted = AESUtil.encrypt(text, longKey);
        String decrypted = AESUtil.decrypt(encrypted, longKey);

        assertEquals(text, decrypted);
    }
}