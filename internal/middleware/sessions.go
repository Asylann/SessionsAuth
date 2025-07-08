package middleware

import (
	"WebSportwareShop/internal/db"
	"WebSportwareShop/internal/httpresponse"
	"context"
	"log"
	"net/http"
	"time"
)

type ctxKey string

const (
	ctxKeyUserID ctxKey = "userID"
	ctxKeyRoleID ctxKey = "roleID"
)

func Sessions() func(handler http.Handler) http.Handler {
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
			_, err = db.GetUser(ctx, session.UserID)
			if err != nil {
				log.Println("User do not found")
				httpresponse.WriteJSON(w, http.StatusNotFound, "", "User not found")
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
func UserIDFromContext(ctx context.Context) (int, bool) {
	id, ok := ctx.Value(ctxKeyUserID).(int)
	return id, ok
}

func RoleIDFromContext(ctx context.Context) (int, bool) {
	id, ok := ctx.Value(ctxKeyRoleID).(int)
	return id, ok
}
