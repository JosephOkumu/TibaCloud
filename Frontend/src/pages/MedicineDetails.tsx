import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Search,
  Bell,
  MessageSquare,
  Calendar,
  Package,
  LogOut,
  ShoppingCart,
  ChevronLeft,
  Star,
  Plus,
  Minus,
  ShieldCheck,
  CreditCard,
} from "lucide-react";

interface MedicineType {
  id: number;
  name: string;
  price: number;
  pharmacy: string;
  pharmacyLogo: string;
  pharmacyInitials: string;
  rating: number;
  category: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  description: string;
  dosageAdult: string;
  dosageChildren: string;
  sideEffects: string[];
  form: string;
  manufacturer: string;
  imagePath: string;
}

// Use the pill image provided by the user
const commonMedicineImg =
  "/lovable-uploads/a05b3053-380f-4711-b032-bc48d1c082f0.png";

// Mock data for the medicine details
const medicineData: MedicineType[] = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    price: 250,
    pharmacy: "MediPharm",
    pharmacyLogo: "https://randomuser.me/api/portraits/women/2.jpg",
    pharmacyInitials: "MP",
    rating: 4.8,
    category: "Pain Relief",
    status: "In Stock",
    description:
      "Paracetamol is a commonly used medicine that can help treat pain and reduce a high temperature (fever). It's typically used to relieve mild or moderate pain, such as headaches, toothache or sprains, and reduce fevers caused by illnesses such as colds and flu.",
    dosageAdult:
      "1-2 tablets every 4-6 hours as needed, not exceeding 8 tablets in 24 hours.",
    dosageChildren:
      "For children 6-12 years: 1/2 to 1 tablet every 4-6 hours as needed, not exceeding 4 tablets in 24 hours. Not recommended for children under 6 without medical advice.",
    sideEffects: ["Nausea", "Stomach pain", "Allergic reactions (rare)"],
    form: "Tablets",
    manufacturer: "GSK Pharmaceuticals",
    imagePath: commonMedicineImg,
  },
  {
    id: 2,
    name: "Amoxicillin 250mg",
    price: 450,
    pharmacy: "HealthPlus",
    pharmacyLogo: "",
    pharmacyInitials: "HP",
    rating: 4.7,
    category: "Antibiotics",
    status: "In Stock",
    description:
      "Amoxicillin is an antibiotic used to treat a number of bacterial infections. These include middle ear infection, strep throat, pneumonia, skin infections, and urinary tract infections.",
    dosageAdult:
      "250mg to 500mg every 8 hours or 500mg to 875mg every 12 hours, depending on the type and severity of infection.",
    dosageChildren:
      "20 to 40mg/kg/day divided into 3 doses every 8 hours or 2 doses every 12 hours, depending on weight and severity of infection.",
    sideEffects: ["Diarrhea", "Rash", "Nausea", "Vomiting"],
    form: "Capsules",
    manufacturer: "Pfizer Inc.",
    imagePath: commonMedicineImg,
  },
  {
    id: 3,
    name: "Ibuprofen 400mg",
    price: 350,
    pharmacy: "MediPharm",
    pharmacyLogo: "https://randomuser.me/api/portraits/women/2.jpg",
    pharmacyInitials: "MP",
    rating: 4.5,
    category: "Pain Relief",
    status: "Low Stock",
    description:
      "Ibuprofen is a nonsteroidal anti-inflammatory drug (NSAID) used to relieve pain, reduce inflammation, and lower fever. It works by blocking the production of certain natural substances that cause inflammation.",
    dosageAdult:
      "400mg to 800mg every 6 to 8 hours as needed, not exceeding 3,200mg per day.",
    dosageChildren:
      "5 to 10mg/kg every 6 to 8 hours. Children's dosage should be determined by a doctor based on weight.",
    sideEffects: ["Stomach upset", "Heartburn", "Dizziness", "Headache"],
    form: "Tablets",
    manufacturer: "Reckitt Benckiser",
    imagePath: commonMedicineImg,
  },
  {
    id: 4,
    name: "Loratadine 10mg",
    price: 550,
    pharmacy: "SafeCare Pharmacy",
    pharmacyLogo: "",
    pharmacyInitials: "SP",
    rating: 4.9,
    category: "Allergy Relief",
    status: "In Stock",
    description:
      "Loratadine is an antihistamine that reduces the effects of natural chemical histamine in the body. Histamine can produce symptoms of sneezing, itching, watery eyes, and runny nose. It is used to treat the symptoms of allergies.",
    dosageAdult: "10mg once daily.",
    dosageChildren:
      "For children 6 years and older: 10mg once daily. For children 2-5 years: 5mg once daily.",
    sideEffects: ["Headache", "Drowsiness", "Dry mouth"],
    form: "Tablets",
    manufacturer: "Johnson & Johnson",
    imagePath: commonMedicineImg,
  },
  {
    id: 5,
    name: "Metformin 500mg",
    price: 650,
    pharmacy: "HealthPlus",
    pharmacyLogo: "",
    pharmacyInitials: "HP",
    rating: 4.6,
    category: "Diabetes",
    status: "In Stock",
    description:
      "Metformin is used to treat type 2 diabetes. It is used along with diet and exercise to help control blood sugar levels. It works by decreasing the amount of sugar your liver makes and helping your body use insulin more effectively.",
    dosageAdult:
      "Start with 500mg twice daily with meals. May increase to 2,000mg per day based on response.",
    dosageChildren:
      "Not typically prescribed for children under 10 years. For children 10-16 years, dosage should be determined by a doctor.",
    sideEffects: ["Nausea", "Diarrhea", "Stomach upset", "Metallic taste"],
    form: "Tablets",
    manufacturer: "Merck & Co.",
    imagePath: commonMedicineImg,
  },
  {
    id: 6,
    name: "Omeprazole 20mg",
    price: 450,
    pharmacy: "MediPharm",
    pharmacyLogo: "https://randomuser.me/api/portraits/women/2.jpg",
    pharmacyInitials: "MP",
    rating: 4.7,
    category: "Digestive Health",
    status: "In Stock",
    description:
      "Omeprazole is a proton pump inhibitor that decreases the amount of acid produced in the stomach. It is used to treat symptoms of gastroesophageal reflux disease (GERD) and other conditions involving excessive stomach acid such as Zollinger-Ellison syndrome.",
    dosageAdult: "20mg once daily for 4-8 weeks.",
    dosageChildren:
      "For children 1-16 years: Weight-based dosing determined by a doctor, typically 10-20mg once daily.",
    sideEffects: ["Headache", "Nausea", "Diarrhea", "Stomach pain"],
    form: "Capsules",
    manufacturer: "AstraZeneca",
    imagePath: commonMedicineImg,
  },
];

const MedicineDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [medicine, setMedicine] = useState<MedicineType | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [phoneNumber, setPhoneNumber] = useState("+254");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");

  useEffect(() => {
    // Find the medicine by ID
    const foundMedicine = medicineData.find((med) => med.id === Number(id));
    if (foundMedicine) {
      setMedicine(foundMedicine);
    } else {
      // Redirect if medicine not found
      navigate("/patient-dashboard/medicines");
    }
  }, [id, navigate]);

  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const addToCart = () => {
    toast({
      title: "Added to cart",
      description: `${quantity} x ${medicine?.name} added to your cart.`,
    });
    // In a real application, you would update a cart state or context here
  };

  const proceedToCheckout = () => {
    setIsPaymentModalOpen(true);
  };

  const processPayment = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaymentSuccess(true);
      // In a real application, you would add the order to the user's order history
    }, 2000);
  };

  if (!medicine) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  // Navigation items for the horizontal navbar
  const navItems = [
    {
      icon: Calendar,
      label: "Appointments",
      path: "/patient-dashboard/appointments",
    },
    { icon: Package, label: "Orders", path: "/patient-dashboard/orders" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Top Navigation Bar */}
      <header className="bg-white shadow-sm p-4">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo & User Profile */}
          <div className="flex items-center gap-2">
            <Link to="/patient-dashboard">
              <div className="h-10 w-10 rounded-full bg-secondary-green/80 flex items-center justify-center text-white font-bold">
                AM
              </div>
            </Link>
            <Link to="/patient-dashboard">
              <span className="text-xl font-bold">
                <span className="text-primary-blue">TIBA</span>
                <span className="text-secondary-green"> CLOUD</span>
              </span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="relative hidden md:block max-w-md w-full mx-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="search"
              placeholder="Search for medications..."
              className="pl-10 w-full border-gray-200 focus-visible:ring-secondary-green"
            />
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="relative rounded-full border-none hover:bg-green-50"
            >
              <ShoppingCart className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 bg-red-500 rounded-full w-2 h-2"></span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="relative rounded-full border-none hover:bg-green-50"
            >
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 bg-red-500 rounded-full w-2 h-2"></span>
            </Button>

            {/* User Profile */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end">
                <span className="font-medium text-sm">John Doe</span>
                <span className="text-xs text-gray-500">Patient</span>
              </div>
              <Avatar className="h-9 w-9 border-2 border-secondary-green/20">
                <AvatarImage
                  src="https://randomuser.me/api/portraits/men/32.jpg"
                  alt="User"
                />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Back Button */}
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center text-gray-600"
            onClick={() => navigate("/patient-dashboard/medicines")}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Medicines
          </Button>
        </div>

        {/* Medicine Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Medicine Image */}
          <Card className="md:col-span-1 bg-white overflow-hidden">
            <div className="h-64 bg-white flex items-center justify-center p-4">
              {medicine && (
                <img
                  src={medicine.imagePath}
                  alt={medicine.name}
                  className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-110"
                />
              )}
            </div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge
                  variant={
                    medicine?.status === "In Stock"
                      ? "outline"
                      : medicine?.status === "Low Stock"
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {medicine?.status}
                </Badge>
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm ml-1 font-medium">
                    {medicine?.rating}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Avatar className="h-8 w-8">
                  {medicine?.pharmacyLogo ? (
                    <AvatarImage
                      src={medicine.pharmacyLogo}
                      alt={medicine.pharmacy}
                    />
                  ) : null}
                  <AvatarFallback className="bg-primary-blue/10 text-primary-blue">
                    {medicine?.pharmacyInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span className="text-sm font-medium">
                    {medicine?.pharmacy}
                  </span>
                  <p className="text-xs text-gray-500">Verified Seller</p>
                </div>
                <ShieldCheck className="h-5 w-5 ml-auto text-green-500" />
              </div>
            </CardContent>
          </Card>

          {/* Middle Column - Medicine Info */}
          <Card className="md:col-span-1 bg-white">
            <CardContent className="p-6">
              <h1 className="text-2xl font-bold mb-2 font-playfair">
                {medicine?.name}
              </h1>
              <div className="text-sm text-gray-500 mb-4">
                Category: {medicine?.category}
              </div>
              <div className="text-2xl font-bold text-green-600 mb-6">
                KSh {medicine?.price}
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-gray-700 text-sm">{medicine?.description}</p>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-2">Product Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Form</p>
                    <p className="font-medium">{medicine?.form}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Manufacturer</p>
                    <p className="font-medium">{medicine?.manufacturer}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Dosage and Actions */}
          <Card className="md:col-span-1 bg-white">
            <CardContent className="p-6">
              <Tabs defaultValue="dosage">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="dosage">Dosage</TabsTrigger>
                  <TabsTrigger value="side-effects">Side Effects</TabsTrigger>
                </TabsList>
                <TabsContent value="dosage" className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">For Adults</h3>
                    <p className="text-sm text-gray-700">
                      {medicine?.dosageAdult}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">For Children</h3>
                    <p className="text-sm text-gray-700">
                      {medicine?.dosageChildren}
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="side-effects">
                  <h3 className="font-medium mb-2">Possible Side Effects</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {medicine?.sideEffects.map((effect, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        {effect}
                      </li>
                    ))}
                  </ul>
                </TabsContent>
              </Tabs>

              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-green-500 text-white hover:bg-green-600 border-none"
                    onClick={addToCart}
                  >
                    <ShoppingCart className="h-5 w-5" />
                  </Button>

                  {/* Quantity section moved here */}
                  <div className="flex items-center flex-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-l-md"
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <div className="h-8 px-4 flex items-center justify-center border-y border-input bg-white min-w-12 text-center">
                      {quantity}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-r-md"
                      onClick={increaseQuantity}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-md"
                  onClick={proceedToCheckout}
                >
                  Buy Now
                </Button>
              </div>

              <div className="mt-4 text-xs text-gray-500 text-center">
                Use as directed. Consult a healthcare professional before use.
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Payment Modal - Using the consistent payment style like doctor consultation page */}
      {isPaymentModalOpen && !isPaymentSuccess && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md mx-auto shadow-xl overflow-hidden border-none">
            <div className="bg-gradient-to-r from-primary-blue to-secondary-green text-white p-5">
              <h2 className="text-xl font-bold font-playfair">Checkout</h2>
              <p className="text-sm opacity-90">
                Complete your purchase securely
              </p>
            </div>
            <CardContent className="p-6">
              <div className="border-b pb-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Product</span>
                  <span className="font-medium">{medicine?.name}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Quantity</span>
                  <span>{quantity}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Price</span>
                  <span>
                    KSh {medicine?.price} x {quantity}
                  </span>
                </div>
                <div className="flex justify-between font-bold mt-4 text-lg">
                  <span>Total</span>
                  <span className="text-green-600">
                    KSh {medicine?.price ? medicine.price * quantity : 0}
                  </span>
                </div>
              </div>

              <h3 className="font-medium mb-3">Payment Method</h3>

              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="space-y-3 mb-4"
              >
                {/* M-PESA Payment Option */}
                <div
                  className={`border rounded-lg transition-all ${paymentMethod === "mpesa" ? "border-green-500 bg-green-50" : "border-gray-200"}`}
                >
                  <div className="flex items-center p-4">
                    <RadioGroupItem value="mpesa" id="mpesa" className="mr-3" />
                    <Label
                      htmlFor="mpesa"
                      className="flex flex-1 items-center gap-3 cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                        M
                      </div>
                      <div>
                        <span className="font-medium">M-PESA</span>
                        <p className="text-xs text-gray-600">
                          Fast and secure mobile payment
                        </p>
                      </div>
                    </Label>
                  </div>
                  {paymentMethod === "mpesa" && (
                    <div className="px-4 pb-4 pt-0">
                      <p className="text-sm text-gray-600 mb-3">
                        Enter your phone number to receive payment prompt
                      </p>
                      <Input
                        type="tel"
                        placeholder="Enter your phone number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="mb-2"
                      />
                    </div>
                  )}
                </div>

                {/* Credit Card Option */}
                <div
                  className={`border rounded-lg transition-all ${paymentMethod === "card" ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
                >
                  <div className="flex items-center p-4">
                    <RadioGroupItem value="card" id="card" className="mr-3" />
                    <Label
                      htmlFor="card"
                      className="flex flex-1 items-center gap-3 cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="font-medium">Credit Card</span>
                        <p className="text-xs text-gray-600">
                          Pay with Visa, Mastercard, or American Express
                        </p>
                      </div>
                    </Label>
                  </div>
                  {paymentMethod === "card" && (
                    <div className="px-4 pb-4 pt-0 space-y-3">
                      <div>
                        <Label htmlFor="cardName">Cardholder Name</Label>
                        <Input
                          id="cardName"
                          placeholder="John Doe"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="cardExpiry">Expiry Date</Label>
                          <Input
                            id="cardExpiry"
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cardCvc">CVC</Label>
                          <Input
                            id="cardCvc"
                            placeholder="123"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* PayPal Option */}
                <div
                  className={`border rounded-lg transition-all ${paymentMethod === "paypal" ? "border-blue-600 bg-blue-50" : "border-gray-200"}`}
                >
                  <div className="flex items-center p-4">
                    <RadioGroupItem
                      value="paypal"
                      id="paypal"
                      className="mr-3"
                    />
                    <Label
                      htmlFor="paypal"
                      className="flex flex-1 items-center gap-3 cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                        P
                      </div>
                      <div>
                        <span className="font-medium">PayPal</span>
                        <p className="text-xs text-gray-600">
                          Fast, secure online payment
                        </p>
                      </div>
                    </Label>
                  </div>
                  {paymentMethod === "paypal" && (
                    <div className="px-4 pb-4 pt-0">
                      <p className="text-sm text-gray-600 mb-3">
                        You will be redirected to PayPal to complete your
                        payment securely.
                      </p>
                    </div>
                  )}
                </div>
              </RadioGroup>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsPaymentModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-primary-blue to-secondary-green hover:brightness-90 text-white"
                  onClick={processPayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Pay Now"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment Success Modal */}
      {isPaymentSuccess && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md mx-auto shadow-xl overflow-hidden border-none">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
                <ShieldCheck className="h-10 w-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2 font-playfair">
                Payment Successful!
              </h2>
              <p className="text-gray-600 mb-6">
                Your order has been placed successfully.
              </p>

              <div className="bg-gray-50 p-5 rounded-lg mb-6 text-left">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">Order ID</span>
                  <span className="font-medium">
                    AM{Math.floor(10000 + Math.random() * 90000)}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">Amount Paid</span>
                  <span className="font-medium text-green-600">
                    KSh {medicine?.price ? medicine.price * quantity : 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Method</span>
                  <span className="font-medium">M-PESA</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsPaymentSuccess(false);
                    setIsPaymentModalOpen(false);
                    navigate("/patient-dashboard/medicines");
                  }}
                >
                  Continue Shopping
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-primary-blue to-secondary-green hover:brightness-90 text-white"
                  onClick={() => {
                    setIsPaymentSuccess(false);
                    setIsPaymentModalOpen(false);
                    navigate("/patient-dashboard/orders");
                  }}
                >
                  View Orders
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 font-playfair">
                Tiba Cloud
              </h3>
              <p className="text-gray-400 mb-4">
                Transforming healthcare access and delivery across Africa
                through innovative digital solutions.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <span className="sr-only">Facebook</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MedicineDetails;
