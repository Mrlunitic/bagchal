package com.example.bagchal

import androidx.compose.runtime.*

enum class PieceType { EMPTY, TIGER, GOAT }

data class Position(val row: Int, val col: Int)

class BagchalGameViewModel {
    var board by mutableStateOf(Array(5) { Array(5) { PieceType.EMPTY } })
        private set

    var goatsPlaced by mutableIntStateOf(0)
        private set
    var goatsCaptured by mutableIntStateOf(0)
        private set
    var isTigerTurn by mutableStateOf(false) // Goats move first
        private set
    var message by mutableStateOf("Goats, place a goat!")
        private set

    var selectedPosition by mutableStateOf<Position?>(null)
        private set
    var isGameOver by mutableStateOf(false)
        private set

    init {
        // Initial Tiger positions (4 corners)
        board[0][0] = PieceType.TIGER
        board[0][4] = PieceType.TIGER
        board[4][0] = PieceType.TIGER
        board[4][4] = PieceType.TIGER
    }

    fun onCellClick(row: Int, col: Int) {
        val clickedPos = Position(row, col)

        if (isTigerTurn) {
            handleTigerMove(clickedPos)
        } else {
            handleGoatMove(clickedPos)
        }
    }

    private fun handleTigerMove(pos: Position) {
        val selected = selectedPosition
        if (selected == null) {
            if (board[pos.row][pos.col] == PieceType.TIGER) {
                selectedPosition = pos
                message = "Tiger selected. Move to adjacent empty spot or jump over goat."
            }
        } else {
            if (isValidMove(selected, pos)) {
                movePiece(selected, pos)
                selectedPosition = null
                isTigerTurn = false
                message = "Goats, place or move a goat!"
                checkWinConditions()
            } else if (isValidCapture(selected, pos)) {
                captureGoat(selected, pos)
                selectedPosition = null
                isTigerTurn = false
                message = "Goats, place or move a goat!"
                checkWinConditions()
            } else {
                selectedPosition = null
                message = "Invalid move. Select a tiger again."
            }
        }
    }

    private fun handleGoatMove(pos: Position) {
        if (goatsPlaced < 20) {
            if (board[pos.row][pos.col] == PieceType.EMPTY) {
                board[pos.row][pos.col] = PieceType.GOAT
                goatsPlaced++
                isTigerTurn = true
                message = "Tigers, move a tiger!"
                checkWinConditions()
            }
        } else {
            val selected = selectedPosition
            if (selected == null) {
                if (board[pos.row][pos.col] == PieceType.GOAT) {
                    selectedPosition = pos
                }
            } else {
                if (isValidMove(selected, pos)) {
                    movePiece(selected, pos)
                    selectedPosition = null
                    isTigerTurn = true
                    message = "Tigers, move a tiger!"
                    checkWinConditions()
                } else {
                    selectedPosition = null
                }
            }
        }
    }

    private fun isValidMove(from: Position, to: Position): Boolean {
        if (board[to.row][to.col] != PieceType.EMPTY) return false
        val dRow = Math.abs(from.row - to.row)
        val dCol = Math.abs(from.col - to.col)
        
        // Bagchal allows diagonal moves only from vertices where (row + col) is even
        val isDiagonalAllowed = (from.row + from.col) % 2 == 0
        
        return if (dRow <= 1 && dCol <= 1) {
            if (dRow == 1 && dCol == 1) isDiagonalAllowed else true
        } else false
    }

    private fun isValidCapture(from: Position, to: Position): Boolean {
        if (board[to.row][to.col] != PieceType.EMPTY) return false
        val dRow = to.row - from.row
        val dCol = to.col - from.col

        // Diagonal capture rule: only from even (row + col) vertices
        if (Math.abs(dRow) == 2 && Math.abs(dCol) == 2) {
            if ((from.row + from.col) % 2 != 0) return false
            val midRow = from.row + dRow / 2
            val midCol = from.col + dCol / 2
            return board[midRow][midCol] == PieceType.GOAT
        }
        
        // Orthogonal capture
        if (Math.abs(dRow) == 2 && dCol == 0) {
            val midRow = from.row + dRow / 2
            return board[midRow][from.col] == PieceType.GOAT
        }
        if (Math.abs(dCol) == 2 && dRow == 0) {
            val midCol = from.col + dCol / 2
            return board[from.row][midCol] == PieceType.GOAT
        }
        
        return false
    }

    private fun movePiece(from: Position, to: Position) {
        val piece = board[from.row][from.col]
        board[from.row][from.col] = PieceType.EMPTY
        board[to.row][to.col] = piece
    }

    private fun captureGoat(from: Position, to: Position) {
        val midRow = (from.row + to.row) / 2
        val midCol = (from.col + to.col) / 2
        board[from.row][from.col] = PieceType.EMPTY
        board[midRow][midCol] = PieceType.EMPTY
        board[to.row][to.col] = PieceType.TIGER
        goatsCaptured++
    }

    private fun checkWinConditions() {
        if (goatsCaptured >= 5) {
            message = "CONGRATULATIONS! TIGERS WIN! Captured 5 goats."
            isGameOver = true
            return
        }
        
        var anyTigerCanMove = false
        for (r in 0 until 5) {
            for (c in 0 until 5) {
                if (board[r][c] == PieceType.TIGER) {
                    if (canTigerMove(Position(r, c))) {
                        anyTigerCanMove = true
                        break
                    }
                }
            }
            if (anyTigerCanMove) break
        }
        
        if (!anyTigerCanMove) {
            message = "CONGRATULATIONS! GOATS WIN! Tigers are blocked."
            isGameOver = true
        }
    }

    fun isTigerLocked(row: Int, col: Int): Boolean {
        if (board[row][col] != PieceType.TIGER) return false
        return !canTigerMove(Position(row, col))
    }

    private fun canTigerMove(pos: Position): Boolean {
        // Check all possible moves and captures for a tiger
        for (dr in -2..2) {
            for (dc in -2..2) {
                if (dr == 0 && dc == 0) continue
                val to = Position(pos.row + dr, pos.col + dc)
                if (to.row in 0..4 && to.col in 0..4) {
                    if (isValidMove(pos, to) || isValidCapture(pos, to)) {
                        return true
                    }
                }
            }
        }
        return false
    }
    
    fun reset() {
        board = Array(5) { Array(5) { PieceType.EMPTY } }
        board[0][0] = PieceType.TIGER
        board[0][4] = PieceType.TIGER
        board[4][0] = PieceType.TIGER
        board[4][4] = PieceType.TIGER
        goatsPlaced = 0
        goatsCaptured = 0
        isTigerTurn = false
        message = "Goats, place a goat!"
        selectedPosition = null
        isGameOver = false
    }
}
