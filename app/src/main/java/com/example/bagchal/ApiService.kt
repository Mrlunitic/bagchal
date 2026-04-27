package com.example.bagchal

import retrofit2.http.Body
import retrofit2.http.POST

interface ApiService {
    @POST("api/auth/login")
    suspend fun login(@Body request: Map<String, String>): Map<String, Any>

    @POST("api/auth/signup")
    suspend fun signup(@Body request: Map<String, String>): Map<String, Any>
}
