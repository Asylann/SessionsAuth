package handlers

import (
	"WebSportwareShop/internal/db"
	"WebSportwareShop/internal/httpresponse"
	"WebSportwareShop/internal/models"
	"context"
	"encoding/json"
	"github.com/gorilla/mux"
	"log"
	"math/rand"
	"net/http"
	"strconv"
	"time"
)

type loginReq struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func RandomIdGenerate() string {
	var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")

	b := make([]rune, 10)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}

func LoginHandle(w http.ResponseWriter, r *http.Request) {
	var req loginReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Println(err.Error())
		httpresponse.WriteJSON(w, http.StatusBadRequest, nil, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()
	userInDB, err := db.GetUserByEmail(ctx, req.Email)
	if err != nil {
		log.Println(err.Error())
		httpresponse.WriteJSON(w, http.StatusBadRequest, nil, err.Error())
		return
	}

	if userInDB.Password != req.Password {
		httpresponse.WriteJSON(w, http.StatusUnauthorized, nil, "invalid password")
		return
	}

	sessionId := RandomIdGenerate()
	ctx, cancel = context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()
	err = db.AddSession(ctx, sessionId, userInDB.ID)

	cookie := &http.Cookie{
		Name:  "session",
		Value: sessionId,
	}

	http.SetCookie(w, cookie)

	log.Printf("User by email: %v loged in!", userInDB.Email)
	httpresponse.WriteJSON(w, http.StatusOK, "Success", "")
}

func LogoutHandle(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("session")
	if err != nil {
		log.Println("can not found Cookie")
		httpresponse.WriteJSON(w, http.StatusBadRequest, "", "can not found Cookie")
		return
	}
	sessionId := cookie.Value
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()
	_, err = db.GetSession(ctx, sessionId)
	if err != nil {
		log.Println("Session do not found")
		httpresponse.WriteJSON(w, http.StatusNotFound, "", "Session not found")
		return
	}
	ctx, cancel = context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()
	err = db.DeleteSession(ctx, sessionId)
	if err != nil {
		log.Println(err.Error())
		httpresponse.WriteJSON(w, http.StatusInternalServerError, "", err.Error())
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:   "session",
		Value:  "",
		Path:   "/",
		MaxAge: -1,
	})

	log.Printf("Session by id = %v was deleted", sessionId)
	httpresponse.WriteJSON(w, http.StatusOK, "Logged out", "")
}

func CreateUserHandle(w http.ResponseWriter, r *http.Request) {
	var u models.User
	if err := json.NewDecoder(r.Body).Decode(&u); err != nil {
		log.Println(err.Error())
		httpresponse.WriteJSON(w, http.StatusBadRequest, nil, err.Error())
		return
	}
	users, err := db.ListOfUsers(context.Background())
	for _, user := range users {
		if user.Email == u.Email {
			httpresponse.WriteJSON(w, http.StatusConflict, nil, "Already exists")
		}
	}

	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()
	err = db.CreateUser(ctx, &u)
	if err != nil {
		log.Println(err.Error())
		httpresponse.WriteJSON(w, http.StatusBadRequest, nil, err.Error())
		return
	}
	httpresponse.WriteJSON(w, http.StatusCreated, u.Email, "")
	log.Printf("User was created! : %v \n", u)
}

func GetUserHandle(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		log.Println(err.Error())
		httpresponse.WriteJSON(w, http.StatusBadRequest, nil, err.Error())
		return
	}
	var u models.User
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()
	u, err = db.GetUser(ctx, id)
	if err != nil {
		log.Println(err.Error())
		httpresponse.WriteJSON(w, http.StatusUnauthorized, nil, err.Error())
		return
	}
	httpresponse.WriteJSON(w, http.StatusOK, u, "")
	log.Printf("User by id=%v was recieved! \n", id)
}

func DeleteUserHandle(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		log.Println(err.Error())
		httpresponse.WriteJSON(w, http.StatusBadRequest, nil, err.Error())
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()
	err = db.DeleteUser(ctx, id)
	if err != nil {
		log.Println(err.Error())
		httpresponse.WriteJSON(w, http.StatusBadRequest, nil, err.Error())
		return
	}
	w.WriteHeader(http.StatusNoContent)
	log.Printf("User by id=%v was deleted! \n", id)
}

func ListOfUsersHandle(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()
	users, err := db.ListOfUsers(ctx)
	if err != nil {
		log.Println(err.Error())
		httpresponse.WriteJSON(w, http.StatusBadRequest, nil, err.Error())
		return
	}
	httpresponse.WriteJSON(w, http.StatusOK, users, "")
	log.Printf("All Users list were received!!!")
}

func UpdateUserHandle(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		log.Println(err.Error())
		httpresponse.WriteJSON(w, http.StatusBadRequest, nil, err.Error())
		return
	}
	var u models.User
	if err = json.NewDecoder(r.Body).Decode(&u); err != nil {
		log.Println(err.Error())
		httpresponse.WriteJSON(w, http.StatusBadRequest, nil, err.Error())
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()
	u.ID = id
	err = db.UpdateUser(ctx, &u)
	if err != nil {
		log.Println(err.Error())
		httpresponse.WriteJSON(w, http.StatusBadRequest, nil, err.Error())
		return
	}
	httpresponse.WriteJSON(w, http.StatusOK, u, "")
	log.Printf("User by id = %v was updated : %v", id, u)
}

func GetUserEmailHandle(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		log.Println(err.Error())
		httpresponse.WriteJSON(w, http.StatusBadRequest, nil, err.Error())
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()
	var email string
	email, err = db.GetUserEmail(ctx, id)
	if err != nil {
		log.Println(err.Error())
		httpresponse.WriteJSON(w, http.StatusNotFound, nil, err.Error())
		return
	}
	httpresponse.WriteJSON(w, http.StatusOK, email, "")
	log.Printf("User`s email by id = %v was recieved \n", id)
}
