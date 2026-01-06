#!/usr/bin/env python3
"""
Diagnostic script to test Google ADK agent and find correct method
Run this locally to determine the right way to invoke the agent
"""

import sys

try:
    from good_kid_agent import root_agent
    print("✅ Agent imported successfully!")
    print(f"Agent type: {type(root_agent)}")
    print(f"Agent class: {root_agent.__class__.__name__}")
    
    # List all available methods
    methods = [m for m in dir(root_agent) if not m.startswith('_')]
    print(f"\n📋 Available methods:")
    for method in methods:
        print(f"  - {method}")
    
    # Try to find documentation
    if hasattr(root_agent, '__doc__'):
        print(f"\n📖 Agent documentation:")
        print(root_agent.__doc__)
    
    # Test various possible invocation methods
    print("\n🧪 Testing invocation methods...")
    test_message = "Halo"
    
    # Method 1: Direct call
    if callable(root_agent):
        try:
            result = root_agent(test_message)
            print(f"✅ Method 1 WORKS: root_agent(message)")
            print(f"   Result type: {type(result)}")
            print(f"   Result: {str(result)[:100]}")
            sys.exit(0)
        except Exception as e:
            print(f"❌ Method 1 failed: {e}")
    
    # Method 2: .run()
    if hasattr(root_agent, 'run'):
        try:
            result = root_agent.run(test_message)
            print(f"✅ Method 2 WORKS: root_agent.run(message)")
            print(f"   Result type: {type(result)}")
            print(f"   Result: {str(result)[:100]}")
            sys.exit(0)
        except Exception as e:
            print(f"❌ Method 2 failed: {e}")
    
    # Method 3: .send_message()
    if hasattr(root_agent, 'send_message'):
        try:
            result = root_agent.send_message(test_message)
            print(f"✅ Method 3 WORKS: root_agent.send_message(message)")
            print(f"   Result type: {type(result)}")
            print(f"   Result: {str(result)[:100]}")
            sys.exit(0)
        except Exception as e:
            print(f"❌ Method 3 failed: {e}")
    
    # Method 4: Using runner
    try:
        from google.adk.runners import Runner
        from google.adk.sessions import InMemorySessionService
        
        session_service = InMemorySessionService()
        runner = Runner(
            agent=root_agent,
            session_service=session_service,
            app_name="test"
        )
        result = runner.run(user_id="test", prompt=test_message)
        print(f"✅ Method 4 WORKS: Using Runner")
        print(f"   Result type: {type(result)}")
        print(f"   Result: {str(result)[:100]}")
        sys.exit(0)
    except Exception as e:
        print(f"❌ Method 4 failed: {e}")
    
    print("\n❌ No working method found!")
    print("Please check Google ADK documentation for your version")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
