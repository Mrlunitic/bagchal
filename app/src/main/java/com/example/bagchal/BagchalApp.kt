package com.example.bagchal

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.*
import kotlinx.coroutines.delay

@Composable
fun BagchalApp() {
    val navController = rememberNavController()
    NavHost(navController = navController, startDestination = "login") {
        composable("login") { LoginScreen(navController) }
        composable("signup") { SignupScreen(navController) }
        composable("game") { GameScreen(navController) }
    }
}

@Composable
fun LoginScreen(navController: NavHostController) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Image(
            painter = painterResource(id = R.drawable.app_icon),
            contentDescription = "App Icon",
            modifier = Modifier.size(150.dp).padding(bottom = 16.dp),
            contentScale = ContentScale.Fit
        )
        Text("Bagh-Chal Login", fontSize = 32.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(32.dp))
        OutlinedTextField(value = email, onValueChange = { email = it }, label = { Text("Email") })
        OutlinedTextField(value = password, onValueChange = { password = it }, label = { Text("Password") })
        Spacer(Modifier.height(16.dp))
        Button(onClick = { navController.navigate("game") }) { Text("Login") }
        TextButton(onClick = { navController.navigate("signup") }) { Text("New User? Sign Up") }
    }
}

@Composable
fun SignupScreen(navController: NavHostController) {
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("Bagh-Chal Signup", fontSize = 32.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(32.dp))
        
        if (errorMessage != null) {
            Text(errorMessage!!, color = Color.Red, modifier = Modifier.padding(bottom = 8.dp))
        }

        OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Name") })
        OutlinedTextField(value = email, onValueChange = { email = it }, label = { Text("Email") })
        OutlinedTextField(value = password, onValueChange = { password = it }, label = { Text("Password") })
        Spacer(Modifier.height(16.dp))
        Button(onClick = { 
            if (name.isBlank() || email.isBlank() || password.isBlank()) {
                errorMessage = "All fields are required"
            } else if (!email.contains("@")) {
                errorMessage = "Invalid email format"
            } else if (password.length < 6) {
                errorMessage = "Password must be at least 6 characters"
            } else {
                navController.navigate("game") 
            }
        }) { Text("Sign Up") }
        TextButton(onClick = { navController.navigate("login") }) { Text("Already have an account? Login") }
    }
}

@Composable
fun GameScreen(navController: NavHostController) {
    val gameViewModel = remember { BagchalGameViewModel() }
    var showGuide by remember { mutableStateOf(false) }

    LaunchedEffect(gameViewModel.isGameOver) {
        if (gameViewModel.isGameOver) {
            delay(3000)
            gameViewModel.reset()
        }
    }

    Column(modifier = Modifier
        .fillMaxSize()
        .background(Color(0xFFFDF1D5)) // Creamy Background
        .padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        
        Spacer(Modifier.height(48.dp)) // Increased spacing from status bar

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = { showGuide = true }) {
                Image(
                    painter = painterResource(id = R.drawable.how_to_play_icon),
                    contentDescription = "How to Play",
                    modifier = Modifier.size(50.dp)
                )
            }
            Column(horizontalAlignment = Alignment.End) {
                Text("Goats Captured: ${gameViewModel.goatsCaptured}", fontSize = 16.sp, color = Color.DarkGray, fontWeight = FontWeight.Bold)
                Text("Goats Placed: ${gameViewModel.goatsPlaced}", fontSize = 16.sp, color = Color.DarkGray, fontWeight = FontWeight.Bold)
            }
        }
        Text(gameViewModel.message, fontSize = 20.sp, fontWeight = FontWeight.Medium, color = Color.Blue, modifier = Modifier.padding(16.dp))

        // 5x5 Grid Board
        Box(modifier = Modifier
            .aspectRatio(1f)
            .padding(8.dp)) {
            // Board Image Background
            Image(
                painter = painterResource(id = R.drawable.board),
                contentDescription = "Board",
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.FillBounds
            )
            
            Column(modifier = Modifier.fillMaxSize()) {
                for (r in 0 until 5) {
                    Row(modifier = Modifier.weight(1f)) {
                        for (c in 0 until 5) {
                            val piece = gameViewModel.board[r][c]
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .fillMaxHeight()
                                    .clickable { gameViewModel.onCellClick(r, c) },
                                contentAlignment = Alignment.Center
                            ) {
                                when (piece) {
                                    PieceType.TIGER -> {
                                        val isLocked = gameViewModel.isTigerLocked(r, c)
                                        Box(
                                            modifier = Modifier
                                                .fillMaxSize(0.9f)
                                                .then(if (isLocked) Modifier.border(2.dp, Color.Red, CircleShape) else Modifier),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Image(
                                                painter = painterResource(id = R.drawable.goat),
                                                contentDescription = "Tiger",
                                                modifier = Modifier.fillMaxSize(0.9f),
                                                contentScale = ContentScale.Fit
                                            )
                                        }
                                    }
                                    PieceType.GOAT -> Image(
                                        painter = painterResource(id = R.drawable.tiger),
                                        contentDescription = "Goat",
                                        modifier = Modifier.fillMaxSize(0.6f),
                                        contentScale = ContentScale.Fit
                                    )
                                    else -> {}
                                }
                            }
                        }
                    }
                }
            }
        }
        Spacer(Modifier.height(32.dp))
        Button(onClick = { gameViewModel.reset() }, colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF7A0019))) { Text("Reset Game", color = Color.White) }
        Button(onClick = { navController.popBackStack() }, colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF7A0019)), modifier = Modifier.padding(8.dp)) { Text("Logout", color = Color.White) }
    }

    if (showGuide) {
        BaghchalGuideDialog(onDismiss = { showGuide = false })
    }
}

@Composable
fun BaghchalGuideDialog(onDismiss: () -> Unit) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("How to Play Bagh-Chal", fontWeight = FontWeight.Bold) },
        text = {
            Column(modifier = Modifier.verticalScroll(rememberScrollState())) {
                Text("🔹 1. Game Setup", fontWeight = FontWeight.Bold)
                Text("Board: 5x5 grid with connected lines.\nTigers: 4 (starting at corners).\nGoats: 20 (placed one by one).")
                Spacer(Modifier.height(8.dp))
                
                Text("🔹 2. Game Phases", fontWeight = FontWeight.Bold)
                Text("Phase 1: Placement - Goat places a piece, then Tiger moves.\nPhase 2: Movement - Starts after all 20 goats are placed. Both players move.")
                Spacer(Modifier.height(8.dp))

                Text("🔹 3. Movement Rules", fontWeight = FontWeight.Bold)
                Text("🐐 Goats: Move 1 step to adjacent connected points. No jumping.\n🐅 Tigers: Move 1 step OR jump over a goat to an empty spot to capture it.")
                Spacer(Modifier.height(8.dp))

                Text("🔹 4. Winning Conditions", fontWeight = FontWeight.Bold)
                Text("🐅 Tigers Win: Capture 5 goats.\n🐐 Goats Win: Block all tigers so they cannot move.")
            }
        },
        confirmButton = {
            Button(onClick = onDismiss) { Text("Got it!") }
        }
    )
}