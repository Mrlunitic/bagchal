package com.example.bagchal

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore("user_prefs")

class TokenManager(private val context: Context) {
    companion object {
        private val TOKEN_KEY = stringPreferencesKey("jwt_token")
        private val USER_NAME_KEY = stringPreferencesKey("user_name")
    }

    val token: Flow<String?> = context.dataStore.data.map { it[TOKEN_KEY] }
    val userName: Flow<String?> = context.dataStore.data.map { it[USER_NAME_KEY] }

    suspend fun saveToken(token: String, name: String) {
        context.dataStore.edit {
            it[TOKEN_KEY] = token
            it[USER_NAME_KEY] = name
        }
    }

    suspend fun clearToken() {
        context.dataStore.edit {
            it.remove(TOKEN_KEY)
            it.remove(USER_NAME_KEY)
        }
    }
}
