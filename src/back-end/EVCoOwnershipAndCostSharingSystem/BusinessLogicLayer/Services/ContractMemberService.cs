using DataAccessLayer.Entities;
using DataAccessLayer.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services
{
    public class ContractMemberService
    {
        private readonly ContractMemberRepository _cmr;
        private readonly UserService _us;
        private readonly EmailService _es;

        private const string systemEmail = "phuhung258@gmail.com";
        private const string systemAppPassword = "zrsw mewp lawc osxa";

        public ContractMemberService()
        {
            _es = new EmailService(
                smtpServer: "smtp.gmail.com",
                smtpPort: 587,
                smtpUser: systemEmail,
                smtpPass: systemAppPassword,
                fromEmail: systemEmail
            );
            _us = new UserService();

            _cmr = new ContractMemberRepository();
        }

        public bool UpdateMemberStatus(int contractId, int userId, string status)
        {
            return _cmr.UpdateMemberStatus(contractId, userId, status);
        }

        public void AddContractMember(int contractId, int userId, decimal sharePercent, DateTime joinedAt, string status)
        {
            ContractMember contractMember = new ContractMember
            {
                ContractId = contractId,
                UserId = userId,
                SharePercent = sharePercent,
                JoinedAt = joinedAt,
                Status = status
            };
            _cmr.AddContractMember(contractMember);
        }

        public List<int> GetContractIdsByUserId(int userId)
        {
            return _cmr.GetContractIdsByUserId(userId);
        }

        public async Task SendNotificationToMember(int memberId, int contractId)
        {
            var member = _us.GetUserById(memberId);
            string subject = "Bạn đã bị lùa gà";
            string body = $@"<p>Xin chào {member.FullName},</p>
                            <p>Bạn đã bị lùa gà vào hợp đồng có mã là #{contractId}</p>
                            <p>Hãy sẵn sàng sử dụng số tiền đang có để cống hiến cho người mua xe</p>
                            <p>Xài ké mà đòi chủ xe phải trả hết à</p>
                            <p>Trân trọng,<br><b>EVCO System</b></p>
                            <p><a href =""https://localhost:5173/api/contract/contractVerify/{contractId}"">Bấm vào đây để verify</a></p>";
            try
            {
                await _es.SendEmailAsync(member.Email, subject, body);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ Không thể gửi email cho {member.Email}: {ex.Message}");
            }
        }
    }
}
