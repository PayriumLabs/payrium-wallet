"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header, SideNav, BottomNav } from "@/components/layout";
import { Card, ConfirmModal } from "@/components/ui";
import { useTheme } from "@/components/providers/theme-provider";
import { clearWalletData, getStoredAddress } from "@/lib/wallet";
import { useWalletStore } from "@/stores/wallet-store";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const router = useRouter();
  // Theme is disabled/forced to light, so we don't need setters
  const { address, reset: resetWallet } = useWalletStore();
  const { showToast } = useUIStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleExportPhrase = () => {
    router.push("/settings/export-phrase");
  };

  const handleChangePin = () => {
    router.push("/settings/change-pin");
  };

  const handleLogout = () => {
    clearWalletData();
    resetWallet();
    setShowLogoutModal(false);
    router.replace("/onboard");
  };

  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      showToast({ type: "success", message: "Address copied!" });
    }
  };

  const walletAddress = address || getStoredAddress() || "";
  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "";

  return (
    <div className="flex h-screen w-full bg-[#F5F6F8]">
      <SideNav />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Main Content Container - White on Mobile for "App" feel, Gray on Desktop */}
        <div className="relative w-full md:max-w-2xl mx-auto h-full bg-[#FAFAFA] md:bg-[#F5F6F8] flex flex-col shadow-2xl shadow-black/[0.02]">
          <Header title="Settings" className="bg-white/80 backdrop-blur-xl border-b border-slate-200" />

          <div className="flex-1 overflow-y-auto no-scrollbar pb-32 md:pb-8 px-6 pt-6">
            {/* Wallet Info */}
            <div className="mb-8">
              <div className="p-4 rounded-2xl flex items-center gap-4 bg-gradient-to-br from-white to-slate-50 border border-slate-100 shadow-sm">
                <div className="size-14 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                  <span className="material-symbols-outlined text-[28px]">account_balance_wallet</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[#0F172A] font-bold text-lg">My Wallet</h3>
                  <p className="text-[#64748B] text-sm font-mono truncate bg-slate-100 px-2 py-0.5 rounded-md inline-block mt-1">
                    {shortAddress}
                  </p>
                </div>
                <button
                  onClick={handleCopyAddress}
                  className="size-10 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 flex items-center justify-center transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-[#64748B] text-[20px]">content_copy</span>
                </button>
              </div>
            </div>

            {/* Security Section */}
            <div className="mb-8">
              <h4 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-4 px-1">
                Security
              </h4>
              <div className="space-y-3">
                <SettingsItem
                  icon="key"
                  title="Export Recovery Phrase"
                  subtitle="Back up your 12-word phrase"
                  onClick={handleExportPhrase}
                />
                <SettingsItem
                  icon="lock"
                  title="Change PIN"
                  subtitle="Update your wallet PIN"
                  onClick={handleChangePin}
                />
              </div>
            </div>

            {/* Preferences Section */}
            <div className="mb-8">
              <h4 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-4 px-1">
                Preferences
              </h4>
              <div className="space-y-3">
                {/* Removed Theme Toggle since we are strictly enforcing Light Mode */}
                
                <SettingsItem
                  icon="language"
                  title="Language"
                  subtitle="English"
                  onClick={() => {}}
                />
                <SettingsItem
                  icon="attach_money"
                  title="Currency"
                  subtitle="USD"
                  onClick={() => {}}
                />
              </div>
            </div>

            {/* Network Section */}
            <div className="mb-8">
              <h4 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-4 px-1">
                Network
              </h4>
              <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                    <span className="text-[10px] font-bold">BNB</span>
                  </div>
                  <div>
                    <p className="text-[#0F172A] font-medium text-sm">BNB Smart Chain</p>
                    <p className="text-[#64748B] text-xs">Mainnet</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1 bg-green-50 rounded-full border border-green-200">
                  <span className="size-2 rounded-full bg-[#10B981] animate-pulse" />
                  <span className="text-[10px] font-bold text-green-700">Active</span>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="mb-8">
              <h4 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-4 px-1">
                About
              </h4>
              <div className="space-y-3">
                <SettingsItem
                  icon="info"
                  title="App Version"
                  subtitle="1.0.0-beta"
                  showChevron={false}
                />
                <SettingsItem
                  icon="description"
                  title="Terms of Service"
                  onClick={() => {}}
                />
              </div>
            </div>

            {/* Danger Zone */}
            <div className="mb-8">
              <h4 className="text-xs font-bold text-[#EF4444] uppercase tracking-wider mb-4 px-1">
                Danger Zone
              </h4>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full p-4 rounded-2xl border border-red-200 bg-red-50/50 text-[#EF4444] font-medium hover:bg-red-100/50 transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                Clear Wallet & Logout
              </button>
            </div>
          </div>

          <BottomNav />
        </div>
      </main>

      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Clear Wallet?"
        message="This will remove your wallet from this device. Make sure you have backed up your recovery phrase before proceeding."
        confirmText="Clear Wallet"
        variant="danger"
      />
    </div>
  );
}

function SettingsItem({
  icon,
  title,
  subtitle,
  onClick,
  showChevron = true,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  showChevron?: boolean;
}) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 transition-all",
        onClick && "cursor-pointer hover:border-blue-200 hover:shadow-md active:scale-[0.99]"
      )}
    >
      <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#64748B]">
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-[#0F172A] font-medium text-sm">{title}</p>
        {subtitle && (
          <p className="text-[#64748B] text-xs">{subtitle}</p>
        )}
      </div>
      
      {showChevron && onClick && (
        <span className="material-symbols-outlined text-slate-300 text-[20px]">
          chevron_right
        </span>
      )}
    </div>
  );
}
