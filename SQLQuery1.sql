USE [C25]
GO
/****** Object:  StoredProcedure [dbo].[Transactions_SelectById]    Script Date: 3/14/2017 11:56:59 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER proc [dbo].[Transactions_SelectById]
			@Id int
as

BEGIN
/*
DECLARE @Id int = 80

EXECUTE dbo.Transactions_SelectById
				@Id
*/
SELECT [Id]
      ,[CaseId]
      ,[ListingId]
	  ,[ParcelNumber]
	  ,[EscrowNumber]
      ,[DateAdded]
      ,[DateModified]
      ,[UserId]
  FROM [dbo].[Transactions]
  WHERE Id = @Id

EXECUTE dbo.Milestones_SelectByTransactionId
			@Id

EXECUTE dbo.Documents_SelectByTransactionId
			@Id

EXECUTE dbo.Participants_SelectByTransactionId
			@Id

EXECUTE dbo.Roles_Base_GetAll

EXECUTE dbo.PendingDocuments_SelectByTransactionId
			@Id

EXECUTE dbo.DocumentTypes_SelectAll

EXECUTE dbo.Chats_SelectByTransactionId
			@Id

EXECUTE dbo.Listings_SelectByTransactionId
			@Id

DECLARE @BuyerId int
SELECT @BuyerId = trans.BuyerId
		from Transactions trans
		WHERE trans.Id = @Id

SELECT Id
      ,FirstName
      ,LastName
      ,PhoneCell
      ,PhoneHome
      ,PhoneWork
      ,EmailPublic
      ,KeyName

  FROM dbo.People
  WHERE Id = @BuyerId

  DECLARE @MlsListingId nvarchar(50) = 0
  DECLARE @ListingId int = 0
SELECT @ListingId = tra.ListingId
		from Transactions tra
		WHERE tra.Id = @Id

SELECT @MlsListingId = listing.MlsListingId
		from Listings listing
		WHERE listing.Id = @ListingId

EXECUTE ListingAgentInfo_SelectInfoByMlsId
		@MlsListingId
END