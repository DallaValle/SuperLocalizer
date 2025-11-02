CREATE DATABASE IF NOT EXISTS superlocalizer;
USE superlocalizer;

CREATE TABLE IF NOT EXISTS ProjectSnapshot (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProjectId INT NOT NULL,
    SnapshotData NVARCHAR(MAX),
    SnapshotDate DATETIME NOT NULL DEFAULT(GETDATE()),
    CONSTRAINT FK_ProjectSnapshot_Project FOREIGN KEY (ProjectId) REFERENCES Project(Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;