using Sabio.Data;
using Sabio.Web.Domain;
using Sabio.Web.Models.Requests;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;

namespace Sabio.Web.Services
{
    public class TransactionsService : BaseService, ITransactionsService
    {
        IParticipantsService _participantsService = null;
        public TransactionsService(IParticipantsService participantsService)
        {
            _participantsService = participantsService;
        }

        public int Insert(TransactionsAddRequest model)
        {
            string UserId = UserService.GetCurrentUserId();
            int Id = 0;

            DataProvider.ExecuteNonQuery(GetConnection, "dbo.Transactions_Insert"
                , inputParamMapper: delegate (SqlParameterCollection paramCollection)
                {
                    paramCollection.AddWithValue("@CaseId", model.CaseId);
                    paramCollection.AddWithValue("@ListingId", model.ListingId);
                    paramCollection.AddWithValue("@ParcelNumber", model.ParcelNumber);
                    paramCollection.AddWithValue("@EscrowNumber", model.EscrowNumber);
                    paramCollection.AddWithValue("@BuyerId", model.BuyerId);
                    paramCollection.AddWithValue("@BuyerAgentId", model.BuyerAgentId);
                    paramCollection.AddWithValue("@SalePrice", model.SalePrice);
                    paramCollection.AddWithValue("@UserId", UserId);
                    SqlParameter p = new SqlParameter("@id", System.Data.SqlDbType.Int);
                    p.Direction = System.Data.ParameterDirection.Output;

                    paramCollection.Add(p);
                }, returnParameters: delegate (SqlParameterCollection param)
                {
                    int.TryParse(param["@id"].Value.ToString(), out Id);
                }
                );
            return Id;
        }

        //public void Update(TransactionsUpdateRequest model)
        //{
        //    DataProvider.ExecuteNonQuery(GetConnection, "dbo.Transactions_Update"
        //        , inputParamMapper: delegate (SqlParameterCollection paramCollection)
        //        {
        //            paramCollection.AddWithValue("@caseId", model.CaseId);
        //            paramCollection.AddWithValue("@listingId", model.ListingId);
        //            paramCollection.AddWithValue("@salePrice", model.SalePrice);
        //            paramCollection.AddWithValue("@commission", model.Commission);
        //            paramCollection.AddWithValue("@brokerCut", model.BrokerCut);
        //            paramCollection.AddWithValue("@otherFees", model.OtherFees);
        //            paramCollection.AddWithValue("@transactionStatusId", model.TransactionStatusId);
        //            paramCollection.AddWithValue("@name", model.Name);
        //            paramCollection.AddWithValue("@estimatedOtherFees", model.EstimatedOtherFees);
        //            paramCollection.AddWithValue("@id", model.Id);                    
        //        }, returnParameters: null
        //        );
        //}

        public List<Transaction> Select()
        {
            List<Transaction> list = null;

            DataProvider.ExecuteCmd(GetConnection, "dbo.Transactions_Select",
                inputParamMapper: null,
                map: delegate (IDataReader reader, short set)
                {
                    Transaction p = new Transaction();
                    int startingIndex = 0;

                    p.Id = reader.GetSafeInt32(startingIndex++);
                    p.CaseId = reader.GetSafeInt32(startingIndex++);
                    p.ListingId = reader.GetSafeInt32(startingIndex++);
                    p.SalePrice = reader.GetSafeDecimal(startingIndex++);
                    p.Commission = reader.GetSafeDecimal(startingIndex++);
                    p.BrokerCut = reader.GetSafeDecimal(startingIndex++);
                    p.OtherFees = reader.GetSafeDecimal(startingIndex++);
                    p.DateAdded = reader.GetSafeDateTime(startingIndex++);
                    p.DateModified = reader.GetSafeDateTime(startingIndex++);
                    p.UserId = reader.GetSafeString(startingIndex++);
                    if (list == null)
                    {
                        list = new List<Transaction>();
                    }
                    list.Add(p);
                }
                );
            return list;
        }

        public void Delete(int Id)
        {
            DataProvider.ExecuteNonQuery(GetConnection, "dbo.Transactions_Delete",
                inputParamMapper: delegate (SqlParameterCollection paramCollection)
                {
                    paramCollection.AddWithValue("@id", Id);
                }, returnParameters: null
                );
        }

        public Transaction GetCreationDetails(int CaseId, int ListingId)
        {
            Transaction t = new Transaction();
            DataProvider.ExecuteCmd(GetConnection, "dbo.TransactionsCreateInfo_SelectByListingAndCaseId"
                , inputParamMapper: delegate (SqlParameterCollection paramCollection)
                {
                    paramCollection.AddWithValue("@CaseId", CaseId);
                    paramCollection.AddWithValue("@ListingId", ListingId);
                }
                , map: delegate (IDataReader reader, short set)
                {
                    switch (set)
                    {
                        case 0:
                            PersonBase buyer = MapBuyer(reader);
                            if (t.Buyers == null)
                            {
                                t.Buyers = new List<PersonBase>();
                            }
                            t.Buyers.Add(buyer);
                            break;

                        case 1:
                            PersonBase buyerAgent = MapBuyerAgent(reader);
                            if (t.BuyerAgents == null)
                            {
                                t.BuyerAgents = new List<PersonBase>();
                            }
                            t.BuyerAgents.Add(buyerAgent);
                            break;
                        case 2:
                            TransactionDetails listing = MapTransactionDetails(reader);
                            t.ListingDetails = listing;
                            break;
                        case 3:
                            ListingAgentInfo listingAgent = MapListingAgentInfo(reader);
                            t.ListingAgent = listingAgent;
                            break;
                    }
                }
                );
            return t;
        }

        public Transaction GetById(int id)
        {
            DocumentsService _documentsService = new DocumentsService();
            Transaction t = null;
            Dictionary<int, Milestone> milestoneDictionary = null;
            Dictionary<int, TaskBase> taskDictionary = null;
            Dictionary<int, Chat> chatDictionary = null;
            DataProvider.ExecuteCmd(GetConnection, "dbo.Transactions_SelectById"
               , inputParamMapper: delegate (SqlParameterCollection paramCollection)
               {
                   paramCollection.AddWithValue("@Id", id);
               }
               , map: delegate (IDataReader reader, short set)
               {
                   switch (set)
                   {
                       case 0:
                           t = mapTransaction(reader);
                           break;
                       case 1:
                           int transactionId = 0;
                           Milestone m = MilestonesService.MapMilestone(reader, out transactionId);
                           if (t.Milestones == null)
                           {
                               t.Milestones = new List<Milestone>();
                           }
                           t.Milestones.Add(m);
                           if (milestoneDictionary == null)
                           {
                               milestoneDictionary = new Dictionary<int, Milestone>();
                           }
                           milestoneDictionary.Add(m.Id, m);
                           break;
                       case 2:
                           int milestoneId = 0;
                           TaskBase ta = TasksService.MapTask(reader, out milestoneId);
                           Milestone parentMilestone = milestoneDictionary[milestoneId];
                           if (parentMilestone.Tasks == null)
                           {
                               parentMilestone.Tasks = new List<TaskBase>();
                           }
                           parentMilestone.Tasks.Add(ta);
                           if (taskDictionary == null)
                           {
                               taskDictionary = new Dictionary<int, TaskBase>();
                           }
                           taskDictionary.Add(ta.Id, ta);
                           break;
                       case 3:
                           int taskId = 0;
                           Document d = _documentsService.MapDocument(reader, out taskId);
                           TaskBase parentTask = taskDictionary[taskId];
                           if (parentTask.Documents == null)
                           {
                               parentTask.Documents = new List<Document>();
                           }
                           parentTask.Documents.Add(d);
                           break;
                       case 4:
                           ParticipantBase pb = _participantsService.MapParticipantBase(reader);
                           if (t.Participants == null)
                           {
                               t.Participants = new List<ParticipantBase>();
                           }
                           t.Participants.Add(pb);
                           break;
                       case 5:
                           RoleBase rb = MapRoleBases(reader);
                           if (t.Roles == null)
                           {
                               t.Roles = new List<RoleBase>();
                           }
                           t.Roles.Add(rb);
                           break;
                       case 6:
                           PendingDocument pd = PendingDocumentService.MapPendingDocument(reader);
                           if (t.PendingDocuments == null)
                           {
                               t.PendingDocuments = new List<PendingDocument>();
                           }
                           t.PendingDocuments.Add(pd);
                           break;
                       case 7:
                           DocumentType dt = DocumentTypesService.MapDocumentType(reader);
                           if (t.DocumentTypes == null)
                           {
                               t.DocumentTypes = new List<DocumentType>();
                           }
                           t.DocumentTypes.Add(dt);
                           break;

                       case 8:
                           int chatTaskId = 0;

                           Chat ch = ChatService.ChatMapper(reader, out chatTaskId);
                           TaskBase chatParentTask = taskDictionary[chatTaskId];
                           if (chatParentTask.Chats == null)
                           {
                               chatParentTask.Chats = new List<Chat>();
                           }
                           chatParentTask.Chats.Add(ch);

                           if (chatDictionary == null)
                           {
                               chatDictionary = new Dictionary<int, Chat>();
                           }
                           chatDictionary.Add(ch.Id, ch);
                           break;
                       case 9:
                           int chatId = 0;

                           ChatMessage cm = ChatService.MessageMapper(reader, out chatId);
                           Chat parentChat = chatDictionary[chatId];
                           if (parentChat.Message == null)
                           {
                               parentChat.Message = new List<ChatMessage>();
                           }
                           parentChat.Message.Add(cm);
                           break;
                       case 10:
                           TransactionDetails listingDetails = MapTransactionDetails(reader);
                           t.ListingDetails = listingDetails;
                           break;
                       case 11:
                           PersonBase buyer = MapBuyer(reader);
                           if(t.Buyers == null)
                           {
                               t.Buyers = new List<PersonBase>();
                           }
                           t.Buyers.Add(buyer);
                           break;
                       case 12:
                           ListingAgentInfo listAgent = MapListingAgentInfo(reader);
                           t.ListingAgent = listAgent;
                           break;
                   }
                }
               );
            return t;
        }

        private static TransactionDetails MapTransactionDetails(IDataReader reader)
        {
            int index = 0;
            TransactionDetails listingDetails = new TransactionDetails();

            listingDetails.Id = reader.GetSafeInt32(index++);
            listingDetails.ListingKeyNumeric = reader.GetSafeInt32(index++);
            listingDetails.StreetAddress = reader.GetSafeString(index++);
            listingDetails.City = reader.GetSafeString(index++);
            listingDetails.PostalCode = reader.GetSafeString(index++);
            listingDetails.State = reader.GetSafeString(index++);
            listingDetails.ListPrice = reader.GetSafeInt32(index++);
            listingDetails.BedroomsTotal = reader.GetSafeInt32(index++);
            listingDetails.BathroomsFull = reader.GetSafeInt32(index++);
            listingDetails.LivingArea = reader.GetSafeInt32(index++);
            listingDetails.LotSizeSquareFeet = reader.GetSafeDecimal(index++);
            listingDetails.MlsListingId = reader.GetSafeString(index++);
            listingDetails.MediaUrl = reader.GetSafeString(index++);
            listingDetails.MediaType = reader.GetSafeString(index++);
            return listingDetails;
        }

        public static ListingAgentInfo MapListingAgentInfo(IDataReader reader)
        {
            int index = 0;
            ListingAgentInfo ListingAgent = new ListingAgentInfo();

            ListingAgent.BuyerAgencyCompensation = reader.GetSafeDouble(index++);
            ListingAgent.Contingency = reader.GetSafeString(index++);
            ListingAgent.Disclosures = reader.GetSafeString(index++);
            ListingAgent.ListAgentCellPhone = reader.GetSafeString(index++);
            ListingAgent.ListAgentDirectPhone = reader.GetSafeString(index++);
            ListingAgent.ListAgentEmail = reader.GetSafeString(index++);
            ListingAgent.ListOfficePhone = reader.GetSafeString(index++);
            ListingAgent.LockBoxLocation = reader.GetSafeString(index++);
            ListingAgent.OccupantType = reader.GetSafeString(index++);
            ListingAgent.OwnerName = reader.GetSafeString(index++);
            ListingAgent.PrivateRemarks = reader.GetSafeString(index++);
            ListingAgent.ShowingContactName = reader.GetSafeString(index++);
            ListingAgent.ShowingContactPhone = reader.GetSafeString(index++);
            ListingAgent.ShowingContactType = reader.GetSafeString(index++);
            ListingAgent.ShowingInstructions = reader.GetSafeString(index++);
            return ListingAgent;
        }

        private static RoleBase MapRoleBases(IDataReader reader)
        {
            RoleBase r = new RoleBase();
            int nestedIndex = 0;
            r.Id = reader.GetSafeInt32(nestedIndex++);
            r.Name = reader.GetSafeString(nestedIndex++);
            r.Code = reader.GetSafeString(nestedIndex++);
            return r;
        }

        private static Transaction mapTransaction(IDataReader reader)
        {
            Transaction t = new Transaction();
            int startingIndex = 0;
            t.Id = reader.GetSafeInt32(startingIndex++);
            t.CaseId = reader.GetSafeInt32(startingIndex++);
            t.ListingId = reader.GetSafeInt32(startingIndex++);
            t.ParcelNumber = reader.GetSafeInt32(startingIndex++);
            t.EscrowNumber = reader.GetSafeInt32(startingIndex++);
            t.DateAdded = reader.GetSafeDateTime(startingIndex++);
            t.DateModified = reader.GetSafeDateTime(startingIndex++);
            t.UserId = reader.GetSafeString(startingIndex++);
            return t;
        }

        public static PersonBase MapBuyerAgent(IDataReader reader)
        {
            PersonBase p = new PersonBase();
            int startingIndex = 0;
            p.CaseId = reader.GetSafeInt32(startingIndex++);
            p.Id = reader.GetSafeInt32(startingIndex++);
            p.FirstName = reader.GetSafeString(startingIndex++);
            p.LastName = reader.GetSafeString(startingIndex++);
            p.PhoneCell = reader.GetSafeString(startingIndex++);
            p.PhoneHome = reader.GetSafeString(startingIndex++);
            p.PhoneWork = reader.GetSafeString(startingIndex++);
            p.EmailPublic = reader.GetSafeString(startingIndex++);
            p.KeyName = reader.GetSafeString(startingIndex++);
            p.AgentCommission = reader.GetSafeDecimal(startingIndex++);
            return p;
        }

        public static PersonBase MapBuyer(IDataReader reader)
        {
            PersonBase p = new PersonBase();
            int startingIndex = 0;
            p.Id = reader.GetSafeInt32(startingIndex++);
            p.FirstName = reader.GetSafeString(startingIndex++);
            p.LastName = reader.GetSafeString(startingIndex++);
            p.PhoneCell = reader.GetSafeString(startingIndex++);
            p.PhoneHome = reader.GetSafeString(startingIndex++);
            p.PhoneWork = reader.GetSafeString(startingIndex++);
            p.EmailPublic = reader.GetSafeString(startingIndex++);
            p.KeyName = reader.GetSafeString(startingIndex++);
            return p;
        }

        public int AddTempTrans(TempTransAddRequest request)
        {           
            DataProvider.ExecuteNonQuery(GetConnection, "dbo.Transactions_InsertTemp"
            , inputParamMapper: delegate (SqlParameterCollection paramCollection)
            {
                paramCollection.AddWithValue("@AuthorId", request.AuthorId);
                paramCollection.AddWithValue("@Name", request.Name);
                paramCollection.AddWithValue("@TransactionStatusId", "1");
                paramCollection.AddWithValue("@Id", request.Id);

            }, returnParameters: null);
            return request.Id;
        }

        public List<int> AddTempMilestone(TempTransAddRequest request, int tempTransId)
        {
            int MId = 0;
            List<int> milestones = new List<int>();
            for (var i = 0; i < request.Milestones.Count; i++)
            {
                DataProvider.ExecuteNonQuery(GetConnection, "dbo.Milestones_InsertTemp"
                    , inputParamMapper: delegate (SqlParameterCollection paramCollection)
                    {
                        paramCollection.AddWithValue("@TransactionId", tempTransId);
                        paramCollection.AddWithValue("@Name", request.Milestones[i].Name);
                        paramCollection.AddWithValue("@MilestoneStatusId", "1");

                        SqlParameter p = new SqlParameter("@Id", System.Data.SqlDbType.Int);
                        p.Direction = System.Data.ParameterDirection.Output;
                        paramCollection.Add(p);
                    }, returnParameters: delegate (SqlParameterCollection param)
                    {
                        int.TryParse(param["@Id"].Value.ToString(), out MId);
                    });

                milestones.Add(MId);
            };

            return milestones;
        }

        public List<List<int>> AddTempTasks(TempTransAddRequest request, List<int> tempMilestoneId)
        {
            int Id = 0;

            List<List<int>> milestone = new List<List<int>>();
            for (var i = 0; i < request.Milestones.Count; i++)
            {
                if (request.Milestones[i].Tasks != null)
                {
                    List<int> tasks = new List<int>();
                    for (var j = 0; j < request.Milestones[i].Tasks.Count; j++)
                    {

                        DataProvider.ExecuteNonQuery(GetConnection, "dbo.Tasks_InsertTemp"
                   , inputParamMapper: delegate (SqlParameterCollection paramCollection)
                   {
                       paramCollection.AddWithValue("@MilestoneId", tempMilestoneId[i]);
                       paramCollection.AddWithValue("@Name", request.Milestones[i].Tasks[j].Name);
                       paramCollection.AddWithValue("@TaskStatusId", "1");

                       SqlParameter p = new SqlParameter("@Id", System.Data.SqlDbType.Int);
                       p.Direction = System.Data.ParameterDirection.Output;
                       paramCollection.Add(p);
                   }, returnParameters: delegate (SqlParameterCollection Param)
                   {
                       int.TryParse(Param["@Id"].Value.ToString(), out Id);
                   });
                        tasks.Add(Id);
                    }
                    milestone.Add(tasks);
                }
            };

            return milestone;
        }

    }
}