using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace DataAccessLayer.Entities;

public partial class EvcoOwnershipAndCostSharingSystemContext : DbContext
{
    public EvcoOwnershipAndCostSharingSystemContext()
    {
    }

    public EvcoOwnershipAndCostSharingSystemContext(DbContextOptions<EvcoOwnershipAndCostSharingSystemContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Contract> Contracts { get; set; }

    public virtual DbSet<ContractMember> ContractMembers { get; set; }

    public virtual DbSet<Expense> Expenses { get; set; }

    public virtual DbSet<ExpenseAllocation> ExpenseAllocations { get; set; }

    public virtual DbSet<ExpenseProposal> ExpenseProposals { get; set; }

    public virtual DbSet<ProposalVote> ProposalVotes { get; set; }

    public virtual DbSet<Reservation> Reservations { get; set; }

    public virtual DbSet<Settlement> Settlements { get; set; }

    public virtual DbSet<UsageLog> UsageLogs { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=(local);uid=sa;pwd=1234567890;database=EVCoOwnershipAndCostSharingSystem;TrustServerCertificate=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Contract>(entity =>
        {
            entity.HasKey(e => e.ContractId).HasName("PK__Contract__C90D3409149F72E2");

            entity.HasIndex(e => e.LicensePlate, "UQ__Contract__026BC15C862451E5").IsUnique();

            entity.Property(e => e.ContractId).HasColumnName("ContractID");
            entity.Property(e => e.LicensePlate).HasMaxLength(20);
            entity.Property(e => e.Model).HasMaxLength(100);
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("Pending");
            entity.Property(e => e.VehicleName)
                .HasMaxLength(300)
                .IsUnicode(false);

            entity.HasOne(d => d.CreatorNavigation).WithMany(p => p.Contracts)
                .HasForeignKey(d => d.Creator)
                .HasConstraintName("FK_Contracts_Creator");
        });

        modelBuilder.Entity<ContractMember>(entity =>
        {
            entity.HasKey(e => new { e.ContractId, e.UserId }).HasName("PK__Contract__1875B8C3DC0803D3");

            entity.Property(e => e.ContractId).HasColumnName("ContractID");
            entity.Property(e => e.UserId).HasColumnName("UserID");
            entity.Property(e => e.JoinedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.SharePercent).HasColumnType("decimal(5, 2)");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("Pending");

            entity.HasOne(d => d.Contract).WithMany(p => p.ContractMembers)
                .HasForeignKey(d => d.ContractId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ContractM__Contr__5AEE82B9");

            entity.HasOne(d => d.User).WithMany(p => p.ContractMembers)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ContractM__UserI__5BE2A6F2");
        });

        modelBuilder.Entity<Expense>(entity =>
        {
            entity.HasKey(e => e.ExpenseId).HasName("PK__Expenses__1445CFF3A0ACBD31");

            entity.Property(e => e.ExpenseId).HasColumnName("ExpenseID");
            entity.Property(e => e.AllocationRule).HasMaxLength(20);
            entity.Property(e => e.Amount).HasColumnType("decimal(12, 2)");
            entity.Property(e => e.ContractId).HasColumnName("ContractID");
            entity.Property(e => e.Description).HasMaxLength(200);
            entity.Property(e => e.ProposalId).HasColumnName("ProposalID");
            entity.Property(e => e.ReceiptFile).HasMaxLength(255);
            entity.Property(e => e.Type).HasMaxLength(30);

            entity.HasOne(d => d.Contract).WithMany(p => p.Expenses)
                .HasForeignKey(d => d.ContractId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Expenses__Contra__6EF57B66");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.Expenses)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK__Expenses__Create__70DDC3D8");

            entity.HasOne(d => d.Proposal).WithMany(p => p.Expenses)
                .HasForeignKey(d => d.ProposalId)
                .HasConstraintName("FK__Expenses__Propos__6FE99F9F");
        });

        modelBuilder.Entity<ExpenseAllocation>(entity =>
        {
            entity.HasKey(e => e.AllocationId).HasName("PK__ExpenseA__B3C6D6AB02F8A2B3");

            entity.ToTable("ExpenseAllocation");

            entity.Property(e => e.AllocationId).HasColumnName("AllocationID");
            entity.Property(e => e.Amount).HasColumnType("decimal(12, 2)");
            entity.Property(e => e.ExpenseId).HasColumnName("ExpenseID");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("Unpaid");
            entity.Property(e => e.UserId).HasColumnName("UserID");

            entity.HasOne(d => d.Expense).WithMany(p => p.ExpenseAllocations)
                .HasForeignKey(d => d.ExpenseId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ExpenseAl__Expen__75A278F5");

            entity.HasOne(d => d.User).WithMany(p => p.ExpenseAllocations)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ExpenseAl__UserI__76969D2E");
        });

        modelBuilder.Entity<ExpenseProposal>(entity =>
        {
            entity.HasKey(e => e.ProposalId).HasName("PK__ExpenseP__6F39E100A9F3B1FA");

            entity.Property(e => e.ProposalId).HasColumnName("ProposalID");
            entity.Property(e => e.AllocationRule).HasMaxLength(20);
            entity.Property(e => e.ContractId).HasColumnName("ContractID");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Description).HasMaxLength(200);
            entity.Property(e => e.ExpectedAmount).HasColumnType("decimal(12, 2)");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("Pending");

            entity.HasOne(d => d.Contract).WithMany(p => p.ExpenseProposals)
                .HasForeignKey(d => d.ContractId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ExpensePr__Contr__6383C8BA");

            entity.HasOne(d => d.ProposedByNavigation).WithMany(p => p.ExpenseProposals)
                .HasForeignKey(d => d.ProposedBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ExpensePr__Propo__6477ECF3");
        });

        modelBuilder.Entity<ProposalVote>(entity =>
        {
            entity.HasKey(e => new { e.ProposalId, e.UserId }).HasName("PK__Proposal__BE416DCAF2E39782");

            entity.Property(e => e.ProposalId).HasColumnName("ProposalID");
            entity.Property(e => e.UserId).HasColumnName("UserID");
            entity.Property(e => e.Vote).HasMaxLength(20);
            entity.Property(e => e.VotedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Proposal).WithMany(p => p.ProposalVotes)
                .HasForeignKey(d => d.ProposalId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ProposalV__Propo__693CA210");

            entity.HasOne(d => d.User).WithMany(p => p.ProposalVotes)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ProposalV__UserI__6A30C649");
        });

        modelBuilder.Entity<Reservation>(entity =>
        {
            entity.HasKey(e => e.ReservationId).HasName("PK__Reservat__B7EE5F0417AA7F5E");

            entity.Property(e => e.ReservationId).HasColumnName("ReservationID");
            entity.Property(e => e.ContractId).HasColumnName("ContractID");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.EndTime).HasColumnType("datetime");
            entity.Property(e => e.StartTime).HasColumnType("datetime");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("Pending");
            entity.Property(e => e.UserId).HasColumnName("UserID");

            entity.HasOne(d => d.Contract).WithMany(p => p.Reservations)
                .HasForeignKey(d => d.ContractId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Reservati__Contr__7C4F7684");

            entity.HasOne(d => d.User).WithMany(p => p.Reservations)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Reservati__UserI__7D439ABD");
        });

        modelBuilder.Entity<Settlement>(entity =>
        {
            entity.HasKey(e => e.SettlementId).HasName("PK__Settleme__771254BA09C276DE");

            entity.Property(e => e.SettlementId).HasColumnName("SettlementID");
            entity.Property(e => e.AllocationId).HasColumnName("AllocationID");
            entity.Property(e => e.Amount).HasColumnType("decimal(12, 2)");
            entity.Property(e => e.Method).HasMaxLength(20);
            entity.Property(e => e.PayerId).HasColumnName("PayerID");
            entity.Property(e => e.PaymentDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.ReceiverId).HasColumnName("ReceiverID");
            entity.Property(e => e.Reference).HasMaxLength(100);

            entity.HasOne(d => d.Allocation).WithMany(p => p.Settlements)
                .HasForeignKey(d => d.AllocationId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Settlemen__Alloc__07C12930");

            entity.HasOne(d => d.Payer).WithMany(p => p.SettlementPayers)
                .HasForeignKey(d => d.PayerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Settlemen__Payer__08B54D69");

            entity.HasOne(d => d.Receiver).WithMany(p => p.SettlementReceivers)
                .HasForeignKey(d => d.ReceiverId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Settlemen__Recei__09A971A2");
        });

        modelBuilder.Entity<UsageLog>(entity =>
        {
            entity.HasKey(e => e.UsageId).HasName("PK__UsageLog__29B197C0C1B8B0B8");

            entity.Property(e => e.UsageId).HasColumnName("UsageID");
            entity.Property(e => e.CheckInTime).HasColumnType("datetime");
            entity.Property(e => e.CheckOutTime).HasColumnType("datetime");
            entity.Property(e => e.ContractId).HasColumnName("ContractID");
            entity.Property(e => e.Distance).HasComputedColumnSql("([OdometerEnd]-[OdometerStart])", true);
            entity.Property(e => e.ProofImageEnd).HasMaxLength(255);
            entity.Property(e => e.ProofImageStart).HasMaxLength(255);
            entity.Property(e => e.UserId).HasColumnName("UserID");

            entity.HasOne(d => d.Contract).WithMany(p => p.UsageLogs)
                .HasForeignKey(d => d.ContractId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__UsageLogs__Contr__00200768");

            entity.HasOne(d => d.User).WithMany(p => p.UsageLogs)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__UsageLogs__UserI__01142BA1");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__1788CCACE69F3E2F");

            entity.HasIndex(e => e.DriverLicenseId, "UQ__Users__1E7F505F084E14BD").IsUnique();

            entity.HasIndex(e => e.CitizenId, "UQ__Users__6E49FBED8E7DABBC").IsUnique();

            entity.HasIndex(e => e.Email, "UQ__Users__A9D1053488C4FEC8").IsUnique();

            entity.Property(e => e.UserId).HasColumnName("UserID");
            entity.Property(e => e.BackIdImage)
                .HasMaxLength(300)
                .IsUnicode(false)
                .HasColumnName("backIdImage");
            entity.Property(e => e.BackLicenseImage)
                .HasMaxLength(300)
                .IsUnicode(false)
                .HasColumnName("backLicenseImage");
            entity.Property(e => e.BankAccount).HasMaxLength(50);
            entity.Property(e => e.BankName).HasMaxLength(100);
            entity.Property(e => e.CitizenId)
                .HasMaxLength(20)
                .HasColumnName("CitizenID");
            entity.Property(e => e.DriverLicenseId)
                .HasMaxLength(20)
                .HasColumnName("DriverLicenseID");
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.EmailConfirmationCode).HasMaxLength(10);
            entity.Property(e => e.EmailConfirmationExpiry).HasColumnType("datetime");
            entity.Property(e => e.FrontIdImage)
                .HasMaxLength(300)
                .IsUnicode(false)
                .HasColumnName("frontIdImage");
            entity.Property(e => e.FrontLicenseImage)
                .HasMaxLength(300)
                .IsUnicode(false)
                .HasColumnName("frontLicenseImage");
            entity.Property(e => e.FullName).HasMaxLength(100);
            entity.Property(e => e.Password).HasMaxLength(20);
            entity.Property(e => e.PhoneNumber)
                .HasMaxLength(12)
                .IsUnicode(false);
            entity.Property(e => e.Role).HasMaxLength(20);
            entity.Property(e => e.Status)
                .HasMaxLength(12)
                .IsUnicode(false)
                .HasDefaultValue("Disabled");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
