package middleware

import (
	"WebSportwareShop/internal/db"
	"WebSportwareShop/internal/httpresponse"
	"context"
	"log"
	"net/http"
	"time"
)

func RequireRole(Allowed_levels ...int) func(next http.Handler) http.Handler {

	allowed := make(map[int]struct{}, len(Allowed_levels))
	for _, r := range Allowed_levels {
		allowed[r] = struct{}{}
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			cookie, err := r.Cookie("session")
			if err != nil {
				log.Println(err.Error())
				httpresponse.WriteJSON(w, http.StatusBadRequest, "", "can not found Cookie")
				return
			}
			sessionId := cookie.Value
			ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
			defer cancel()
			session, err := db.GetSession(ctx, sessionId)
			if err != nil {
				log.Println("Session do not found")
				httpresponse.WriteJSON(w, http.StatusNotFound, "", "Session not found")
				return
			}
			ctx, cancel = context.WithTimeout(r.Context(), 2*time.Second)
			defer cancel()
			userInDB, err := db.GetUser(ctx, session.UserID)
			if err != nil {
				log.Println("User do not found")
				httpresponse.WriteJSON(w, http.StatusNotFound, "", "User not found")
				return
			}

			_, ok := allowed[userInDB.RoleId]
			if !ok {
				log.Println("No access to this point")
				httpresponse.WriteJSON(w, http.StatusNotFound, "", "No access")
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
