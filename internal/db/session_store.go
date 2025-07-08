package db

import (
	"WebSportwareShop/internal/models"
	"context"
)

func AddSession(ctx context.Context, id string, userId int) error {
	_, err := stmtAddSession.ExecContext(ctx, id, userId)
	return err
}

func DeleteSession(ctx context.Context, id string) error {
	_, err := stmtDeleteSession.ExecContext(ctx, id)
	return err
}

func GetSession(ctx context.Context, id string) (models.Session, error) {
	var s models.Session
	err := stmtGetSession.QueryRowContext(ctx, id).Scan(&s.ID, &s.UserID)
	if err != nil {
		return models.Session{}, err
	}
	return s, err
}
