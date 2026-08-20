import { useState, useEffect } from "react";
import { addCredits, getProfile } from "../data/profileStore";

interface NigerianPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAmount?: string;
  onSuccess?: (amount: number, ref: string) => void;
}

type PaymentMethod = "transfer" | "card" | "ussd" | "wallet";

const USSD_CODES: Record<string, string> = {
  "GTBank": "*737*2*{amount}*4829#",
  "Zenith Bank": "*966*60*{amount}#",
  "Access Bank": "*901*{amount}*882#",
  "UBA": "*919*3*{amount}*102#",
  "First Bank": "*894*{amount}*552#",
  "Kuda Bank": "*5573*{amount}#",
  "OPay": "*955*{amount}#",
};

export default function NigerianPaymentModal({
  isOpen,
  onClose,
  defaultAmount = "2500",
  onSuccess,
}: NigerianPaymentModalProps) {
  const [amount, setAmount] = useState(defaultAmount);
  const [customAmount, setCustomAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("transfer");
  const [step, setStep] = useState<"select" | "processing" | "otp" | "success">("select");
  const [copied, setCopied] = useState(false);
  const [txRef, setTxRef] = useState("");
  const [otp, setOtp] = useState("");
  const [selectedUssdBank, setSelectedUssdBank] = useState("GTBank");
  const [walletProvider, setWalletProvider] = useState("OPay");
  const [walletPhone, setWalletPhone] = useState("");

  // Card fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardPin, setCardPin] = useState("");

  const finalAmount = customAmount ? parseInt(customAmount, 10) || 0 : parseInt(amount, 10) || 0;

  useEffect(() => {
    if (isOpen) {
      setStep("select");
      setCopied(false);
      setOtp("");
      setCardNumber("");
      setCardExpiry("");
      setCardCvv("");
      setCardPin("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCompletePayment = () => {
    setStep("processing");
    const generatedRef = `RC-PAY-${Math.floor(100000 + Math.random() * 900000)}`;
    setTxRef(generatedRef);

    setTimeout(() => {
      if (method === "card") {
        setStep("otp");
      } else {
        addCredits(finalAmount);
        setStep("success");
        if (onSuccess) onSuccess(finalAmount, generatedRef);
      }
    }, 2000);
  };

  const handleVerifyOtp = () => {
    setStep("processing");
    setTimeout(() => {
      addCredits(finalAmount);
      setStep("success");
      if (onSuccess) onSuccess(finalAmount, txRef);
    }, 1500);
  };

  const profile = getProfile();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border flex flex-col max-h-[90vh]"
        style={{
          background: "var(--color-surface-2)",
          borderColor: "var(--color-border)",
        }}
      >
        {/* Header */}
        <div
          className="p-5 border-b flex items-center justify-between"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-surface)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold text-white shadow-inner"
              style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}
            >
              ₦
            </div>
            <div>
              <div className="font-semibold text-white text-base">
                RideCampus Checkout
              </div>
              <div className="text-xs flex items-center gap-1.5" style={{ color: "var(--color-muted)" }}>
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                Secured Nigerian Payment Gateway
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {step === "processing" && (
            <div className="py-12 text-center space-y-4">
              <div className="w-14 h-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <h3 className="text-lg font-semibold text-white">Verifying Transaction...</h3>
              <p className="text-sm text-gray-400 max-w-xs mx-auto">
                Communicating with Nigerian Inter-Bank Settlement System (NIBSS). Please do not close this window.
              </p>
            </div>
          )}

          {step === "otp" && (
            <div className="space-y-4 py-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-2xl mx-auto mb-2">
                  🔒
                </div>
                <h3 className="text-base font-semibold text-white">Enter Bank OTP</h3>
                <p className="text-xs text-gray-400">
                  A 6-digit one-time password was sent to your registered Nigerian phone number.
                </p>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="• • • • • •"
                  className="w-full text-center tracking-widest text-2xl font-bold py-3 rounded-xl bg-black/40 border border-white/15 text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setStep("select")}
                  className="flex-1 py-3 rounded-xl text-sm font-medium border border-white/10 text-gray-300 hover:bg-white/5 transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={handleVerifyOtp}
                  disabled={otp.length < 4}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all disabled:opacity-50 cursor-pointer"
                >
                  Authorize ₦{finalAmount.toLocaleString()}
                </button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-3xl text-emerald-400 mx-auto animate-bounce">
                ✓
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Payment Successful!</h3>
                <p className="text-sm text-gray-400 mt-1">
                  ₦{finalAmount.toLocaleString()} has been credited to your RideCampus wallet.
                </p>
              </div>

              <div
                className="p-4 rounded-xl text-left space-y-2 text-xs"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div className="flex justify-between">
                  <span className="text-gray-400">Transaction Reference:</span>
                  <span className="font-mono text-white font-semibold">{txRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Payment Channel:</span>
                  <span className="text-white capitalize">{method === "transfer" ? "Virtual Bank Transfer (Providus/Wema)" : method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">New Balance:</span>
                  <span className="text-amber-400 font-bold">₦{profile.balance.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg cursor-pointer"
              >
                Done & Return to App
              </button>
            </div>
          )}

          {step === "select" && (
            <>
              {/* Amount Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  1. Select Top-Up Amount (NGN)
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2.5">
                  {["1000", "2500", "5000", "10000"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setAmount(preset);
                        setCustomAmount("");
                      }}
                      className={`py-2.5 px-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                        amount === preset && !customAmount
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md"
                          : "border-white/10 text-gray-300 hover:bg-white/5"
                      }`}
                    >
                      ₦{parseInt(preset, 10).toLocaleString()}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₦</span>
                  <input
                    type="number"
                    placeholder="Or enter custom amount (e.g. 3500)"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setAmount("");
                    }}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl text-sm bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  2. Choose Payment Channel
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "transfer", label: "Bank Transfer", icon: "🏛️" },
                    { id: "card", label: "Debit Card", icon: "💳" },
                    { id: "ussd", label: "USSD Code", icon: "📱" },
                    { id: "wallet", label: "OPay / Kuda", icon: "⚡" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id as PaymentMethod)}
                      className={`p-2.5 rounded-xl text-center border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                        method === m.id
                          ? "bg-blue-600/20 border-blue-500 text-white shadow-md"
                          : "border-white/10 text-gray-400 hover:bg-white/5"
                      }`}
                    >
                      <span className="text-xl">{m.icon}</span>
                      <span className="text-[11px] font-medium leading-tight">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Method Detail Screen */}
              <div
                className="p-4 rounded-2xl border space-y-3"
                style={{
                  background: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                }}
              >
                {method === "transfer" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Dedicated Virtual Account:</span>
                      <span className="text-emerald-400 font-medium">Expires in 29:58</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-black/40 border border-emerald-500/30 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-400">Providus Bank / Wema</div>
                        <div className="text-xl font-mono font-bold text-white tracking-wider">
                          9948 201 847
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          Account Name: <span className="text-gray-200">RUN-RIDE / {profile.name}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy("9948201847")}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 transition-all cursor-pointer"
                      >
                        {copied ? "Copied! ✓" : "Copy"}
                      </button>
                    </div>

                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      💡 Transfer exactly <strong className="text-white">₦{finalAmount.toLocaleString()}</strong> from any Nigerian banking app (GTBank, Zenith, Access, OPay, etc.). Your wallet will be credited automatically.
                    </p>

                    <button
                      type="button"
                      onClick={handleCompletePayment}
                      disabled={finalAmount < 100}
                      className="w-full py-3 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md cursor-pointer disabled:opacity-50"
                    >
                      I have sent ₦{finalAmount.toLocaleString()} →
                    </button>
                  </div>
                )}

                {method === "card" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Card Number</label>
                      <input
                        type="text"
                        placeholder="5399 4100 0000 0000"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-black/40 border border-white/10 text-white outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          placeholder="12/28"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl text-xs bg-black/40 border border-white/10 text-white outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">CVV</label>
                        <input
                          type="password"
                          placeholder="123"
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl text-xs bg-black/40 border border-white/10 text-white outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCompletePayment}
                      disabled={finalAmount < 100}
                      className="w-full py-3 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md cursor-pointer disabled:opacity-50"
                    >
                      Pay ₦{finalAmount.toLocaleString()} with Card
                    </button>
                  </div>
                )}

                {method === "ussd" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Select Your Bank</label>
                      <select
                        value={selectedUssdBank}
                        onChange={(e) => setSelectedUssdBank(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-black/40 border border-white/10 text-white outline-none"
                      >
                        {Object.keys(USSD_CODES).map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                      <div className="font-mono text-sm font-bold text-amber-400">
                        {USSD_CODES[selectedUssdBank]?.replace("{amount}", finalAmount.toString())}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(USSD_CODES[selectedUssdBank]?.replace("{amount}", finalAmount.toString()))}
                        className="px-2.5 py-1 rounded-lg text-xs bg-white/10 text-white hover:bg-white/20 transition-all cursor-pointer"
                      >
                        {copied ? "Copied!" : "Copy Code"}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleCompletePayment}
                      disabled={finalAmount < 100}
                      className="w-full py-3 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white transition-all shadow-md cursor-pointer disabled:opacity-50"
                    >
                      I have dialed the USSD code →
                    </button>
                  </div>
                )}

                {method === "wallet" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      {["OPay", "PalmPay", "Kuda"].map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => setWalletProvider(w)}
                          className={`py-2 rounded-xl text-xs font-medium border cursor-pointer ${
                            walletProvider === w ? "bg-emerald-500/20 border-emerald-500 text-emerald-300" : "border-white/10 text-gray-400"
                          }`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>

                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">{walletProvider} Phone Number</label>
                      <input
                        type="tel"
                        placeholder="080 1234 5678"
                        value={walletPhone}
                        onChange={(e) => setWalletPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-black/40 border border-white/10 text-white outline-none focus:border-emerald-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleCompletePayment}
                      disabled={finalAmount < 100}
                      className="w-full py-3 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md cursor-pointer disabled:opacity-50"
                    >
                      Authorize via {walletProvider} (₦{finalAmount.toLocaleString()})
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
