import { 
  Calculator, 
  TrendingUp, 
  Wallet, 
  PieChart, 
  Brain, 
  CheckCircle, 
  Star,
  ArrowRight,
  Zap,
  Target,
  BarChart3,
  Users,
  Shield,
  Clock
} from "lucide-react";
import { SignInButton, GetStartedButton } from "@/components/auth/smart-redirect";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calculator className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">BudgetAI</h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
              <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
                Reviews
              </a>
              <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">
                FAQ
              </a>
            </nav>
            <div className="flex space-x-2">
              <SignInButton>
                <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <GetStartedButton>
                <button className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                  Get Started
                </button>
              </GetStartedButton>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 corporate-bg-pattern">
        <div className="text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#cce0ff] to-[#66a3ff] text-[#003366] rounded-full text-sm font-medium mb-6 corporate-shadow">
            <Brain className="h-4 w-4 mr-2" />
            AI-Powered Financial Intelligence
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Master Your Money with{" "}
            <span className="corporate-text-gradient">AI-Powered</span>{" "}
            Budgeting
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            The only budgeting app that combines traditional financial tracking with 
            <strong className="text-[#00509e]"> AI-powered insights</strong> to give you personalized recommendations, 
            detailed analysis, and smart financial guidance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <GetStartedButton>
              <button className="px-8 py-4 corporate-gradient text-white rounded-lg font-medium hover:opacity-90 transition-all duration-300 text-lg flex items-center justify-center corporate-shadow-lg">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </GetStartedButton>
            <button className="px-8 py-4 border-2 border-[#007acc] text-[#007acc] rounded-lg font-medium hover:bg-[#007acc] hover:text-white transition-all duration-300 text-lg corporate-shadow">
              Watch Demo
            </button>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-[#00509e]">
            <div className="flex items-center bg-white/80 px-4 py-2 rounded-full corporate-shadow">
              <Shield className="h-4 w-4 mr-2 text-[#007acc]" />
              Bank-level Security
            </div>
            <div className="flex items-center bg-white/80 px-4 py-2 rounded-full corporate-shadow">
              <Users className="h-4 w-4 mr-2 text-[#007acc]" />
              10,000+ Happy Users
            </div>
            <div className="flex items-center bg-white/80 px-4 py-2 rounded-full corporate-shadow">
              <Clock className="h-4 w-4 mr-2 text-[#007acc]" />
              Setup in 2 Minutes
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-br from-[#f8fafc] to-[#cce0ff]/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 corporate-text-gradient">Everything You Need to Manage Your Finances</h2>
            <p className="text-xl text-[#00509e] max-w-2xl mx-auto">
              From basic budgeting to AI-powered financial insights, we've got you covered.
            </p>
          </div>

          {/* Free Features */}
          <div className="mb-16">
            <h3 className="text-2xl font-semibold mb-8 text-center text-[#003366]">Free Features</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-white rounded-lg border corporate-border corporate-shadow hover:corporate-shadow-lg transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-[#cce0ff] to-[#66a3ff] rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Wallet className="h-8 w-8 text-[#003366]" />
                </div>
                <h4 className="text-xl font-semibold mb-2 text-[#003366]">Smart Budgeting</h4>
                <p className="text-[#00509e]">
                  Create unlimited budgets with intelligent categorization and spending tracking.
                </p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-lg border corporate-border corporate-shadow hover:corporate-shadow-lg transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-[#cce0ff] to-[#66a3ff] rounded-lg flex items-center justify-center mx-auto mb-4">
                  <PieChart className="h-8 w-8 text-[#003366]" />
                </div>
                <h4 className="text-xl font-semibold mb-2 text-[#003366]">Visual Reports</h4>
                <p className="text-[#00509e]">
                  Beautiful charts and graphs to understand your spending patterns.
                </p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-lg border corporate-border corporate-shadow hover:corporate-shadow-lg transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-[#cce0ff] to-[#66a3ff] rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-[#003366]" />
                </div>
                <h4 className="text-xl font-semibold mb-2 text-[#003366]">Goal Tracking</h4>
                <p className="text-[#00509e]">
                  Set and track financial goals with progress monitoring.
                </p>
              </div>
            </div>
          </div>

          {/* Premium Features */}
          <div>
            <div className="text-center mb-8">
              <div className="inline-flex items-center px-4 py-2 corporate-gradient text-white rounded-full text-sm font-medium mb-4 corporate-shadow">
                <Zap className="h-4 w-4 mr-2" />
                Premium Features
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-[#003366]">AI-Powered Financial Intelligence</h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-gradient-to-br from-[#cce0ff]/20 to-[#66a3ff]/20 rounded-lg border-2 border-[#007acc]/30 corporate-shadow-lg hover:corporate-shadow-lg hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-[#007acc] to-[#00509e] rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold mb-2 text-[#003366]">AI Financial Analysis</h4>
                <p className="text-[#00509e]">
                  Get personalized insights and recommendations powered by advanced AI.
                </p>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-[#cce0ff]/20 to-[#66a3ff]/20 rounded-lg border-2 border-[#007acc]/30 corporate-shadow-lg hover:corporate-shadow-lg hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-[#007acc] to-[#00509e] rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold mb-2 text-[#003366]">Detailed Reports</h4>
                <p className="text-[#00509e]">
                  Comprehensive monthly, quarterly, and yearly financial summaries.
                </p>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-[#cce0ff]/20 to-[#66a3ff]/20 rounded-lg border-2 border-[#007acc]/30 corporate-shadow-lg hover:corporate-shadow-lg hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-[#007acc] to-[#00509e] rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold mb-2 text-[#003366]">Smart Predictions</h4>
                <p className="text-[#00509e]">
                  AI-powered forecasting to help you plan for the future.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-[#cce0ff]/20 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 corporate-text-gradient">Simple, Transparent Pricing</h2>
            <p className="text-xl text-[#00509e]">
              Start free, upgrade when you need AI-powered insights.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="p-8 border-2 border-[#e2e8f0] rounded-lg bg-white corporate-shadow hover:corporate-shadow-lg transition-all duration-300">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2 text-[#003366]">Free</h3>
                <div className="text-4xl font-bold mb-2 text-[#007acc]">$0</div>
                <p className="text-[#00509e]">Forever free</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-[#007acc] mr-3" />
                  <span className="text-[#003366]">Unlimited budgets</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-[#007acc] mr-3" />
                  <span className="text-[#003366]">Transaction tracking</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-[#007acc] mr-3" />
                  <span className="text-[#003366]">Basic reports</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-[#007acc] mr-3" />
                  <span className="text-[#003366]">Goal setting</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-[#007acc] mr-3" />
                  <span className="text-[#003366]">Mobile app access</span>
                </li>
              </ul>
              <GetStartedButton>
                <button className="w-full py-3 border-2 border-[#007acc] text-[#007acc] rounded-lg font-medium hover:bg-[#007acc] hover:text-white transition-all duration-300 corporate-shadow">
                  Get Started Free
                </button>
              </GetStartedButton>
            </div>

            {/* Premium Plan */}
            <div className="p-8 border-2 border-[#007acc] rounded-lg bg-gradient-to-br from-[#cce0ff]/30 to-[#66a3ff]/20 relative corporate-shadow-lg hover:corporate-shadow-lg hover:scale-105 transition-all duration-300">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="corporate-gradient text-white px-4 py-1 rounded-full text-sm font-medium corporate-shadow">
                  Most Popular
                </span>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2 text-[#003366]">Premium</h3>
                <div className="text-4xl font-bold mb-2 text-[#007acc]">$9.99</div>
                <p className="text-[#00509e]">per month</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-[#007acc] mr-3" />
                  <span className="text-[#003366]">Everything in Free</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-[#007acc] mr-3" />
                  <strong className="text-[#003366]">AI Financial Analysis</strong>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-[#007acc] mr-3" />
                  <strong className="text-[#003366]">Detailed AI Reports</strong>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-[#007acc] mr-3" />
                  <strong className="text-[#003366]">Smart Predictions</strong>
          </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-[#007acc] mr-3" />
                  <strong className="text-[#003366]">Priority Support</strong>
          </li>
              </ul>
              <GetStartedButton>
                <button className="w-full py-3 corporate-gradient text-white rounded-lg font-medium hover:opacity-90 transition-all duration-300 corporate-shadow-lg">
                  Start Premium Trial
                </button>
              </GetStartedButton>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gradient-to-br from-[#f8fafc] to-[#cce0ff]/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 corporate-text-gradient">Loved by Thousands of Users</h2>
            <p className="text-xl text-[#00509e]">
              See what our users say about BudgetAI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-lg border corporate-border corporate-shadow hover:corporate-shadow-lg transition-all duration-300">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-[#007acc] fill-current" />
                ))}
              </div>
              <p className="text-[#00509e] mb-4">
                "The AI insights have completely changed how I manage my money. The recommendations are spot-on!"
              </p>
              <div className="font-semibold text-[#003366]">Sarah Johnson</div>
              <div className="text-sm text-[#00509e]">Marketing Manager</div>
            </div>

            <div className="p-6 bg-white rounded-lg border corporate-border corporate-shadow hover:corporate-shadow-lg transition-all duration-300">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-[#007acc] fill-current" />
                ))}
              </div>
              <p className="text-[#00509e] mb-4">
                "Finally, a budgeting app that actually understands my spending patterns and gives actionable advice."
              </p>
              <div className="font-semibold text-[#003366]">Mike Chen</div>
              <div className="text-sm text-[#00509e]">Software Engineer</div>
            </div>

            <div className="p-6 bg-white rounded-lg border corporate-border corporate-shadow hover:corporate-shadow-lg transition-all duration-300">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-[#007acc] fill-current" />
                ))}
              </div>
              <p className="text-[#00509e] mb-4">
                "The free features are great, but the AI analysis is worth every penny. It's like having a financial advisor!"
              </p>
              <div className="font-semibold text-[#003366]">Emily Rodriguez</div>
              <div className="text-sm text-[#00509e]">Freelancer</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 corporate-text-gradient">Frequently Asked Questions</h2>
            <p className="text-xl text-[#00509e]">
              Everything you need to know about BudgetAI
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <div className="p-6 border-2 border-[#e2e8f0] rounded-lg bg-white corporate-shadow hover:corporate-shadow-lg transition-all duration-300">
              <h3 className="text-lg font-semibold mb-2 text-[#003366]">Is the free version really free forever?</h3>
              <p className="text-[#00509e]">
                Yes! Our free version includes unlimited budgets, transaction tracking, basic reports, and goal setting. You only pay for premium AI features.
              </p>
            </div>

            <div className="p-6 border-2 border-[#e2e8f0] rounded-lg bg-white corporate-shadow hover:corporate-shadow-lg transition-all duration-300">
              <h3 className="text-lg font-semibold mb-2 text-[#003366]">How does the AI analysis work?</h3>
              <p className="text-[#00509e]">
                Our AI analyzes your spending patterns, income trends, and financial goals to provide personalized insights, recommendations, and detailed reports.
              </p>
            </div>

            <div className="p-6 border-2 border-[#e2e8f0] rounded-lg bg-white corporate-shadow hover:corporate-shadow-lg transition-all duration-300">
              <h3 className="text-lg font-semibold mb-2 text-[#003366]">Can I cancel my subscription anytime?</h3>
              <p className="text-[#00509e]">
                Absolutely! You can cancel your premium subscription at any time. You'll keep access to premium features until the end of your billing period.
              </p>
            </div>

            <div className="p-6 border-2 border-[#e2e8f0] rounded-lg bg-white corporate-shadow hover:corporate-shadow-lg transition-all duration-300">
              <h3 className="text-lg font-semibold mb-2 text-[#003366]">Is my financial data secure?</h3>
              <p className="text-[#00509e]">
                Yes, we use bank-level encryption and security measures. Your data is never shared with third parties and is protected by industry-standard security protocols.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 corporate-gradient">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4 text-white">Ready to Transform Your Finances?</h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Join thousands of users who are already taking control of their financial future with AI-powered insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <GetStartedButton>
              <button className="px-8 py-4 bg-white text-[#003366] rounded-lg font-medium hover:bg-white/90 transition-all duration-300 text-lg corporate-shadow-lg">
                Get Started Free
              </button>
            </GetStartedButton>
            <GetStartedButton>
              <button className="px-8 py-4 border-2 border-white/30 text-white rounded-lg font-medium hover:bg-white/10 transition-all duration-300 text-lg">
                Try Premium Free
              </button>
            </GetStartedButton>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e2e8f0] py-12 bg-[#f8fafc]">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Calculator className="h-6 w-6 text-[#007acc]" />
                <span className="text-xl font-bold text-[#003366]">BudgetAI</span>
              </div>
              <p className="text-[#00509e]">
                AI-powered budgeting for smarter financial decisions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-[#003366]">Product</h4>
              <ul className="space-y-2 text-[#00509e]">
                <li><a href="#" className="hover:text-[#003366] transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-[#003366] transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-[#003366] transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-[#003366]">Support</h4>
              <ul className="space-y-2 text-[#00509e]">
                <li><a href="#" className="hover:text-[#003366] transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-[#003366] transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-[#003366] transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-[#003366]">Company</h4>
              <ul className="space-y-2 text-[#00509e]">
                <li><a href="#" className="hover:text-[#003366] transition-colors">About</a></li>
                <li><a href="#" className="hover:text-[#003366] transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-[#003366] transition-colors">Careers</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#e2e8f0] pt-8 text-center text-[#00509e]">
            <p>&copy; 2024 BudgetAI. All rights reserved. Built with Next.js and Supabase.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
