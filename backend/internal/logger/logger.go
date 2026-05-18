package logger

import (
	"log"
	"os"
)

func New(environment string) *log.Logger {
	return log.New(os.Stdout, "["+environment+"] ", log.LstdFlags|log.LUTC|log.Lshortfile)
}
