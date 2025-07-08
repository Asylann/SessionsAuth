package db

import (
	"database/sql"
	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	"log"
)

func RunMigrations(db *sql.DB) {
	driver, err := postgres.WithInstance(db, &postgres.Config{})
	if err != nil {
		log.Fatal(err, err.Error())
	}
	m, err := migrate.NewWithDatabaseInstance(
		"file//migrations", "postgres", driver,
	)
	if err != nil {
		log.Fatal(err, err.Error())
	}
	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		log.Fatal(err, err.Error())
	}
}
