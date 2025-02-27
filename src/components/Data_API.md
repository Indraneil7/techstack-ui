Below is the JSON for the tables in the database.

{"id":"integer","created_at":"timestamp","name":"text"} - Industry

{"id":"integer","created_at":"timestamp","name":"text"} - Projecttype

{"id":"integer","created_at":"timestamp","name":"text","info":"text"} - processstages

{"id":"integer","created_at":"timestamp","processstages_id":"integer","name":"text","description":"text","tools_id":["integer"]} - substages

{"id":"integer","created_at":"timestamp","name":"text","icon":"image","overview":"text","features":["text"],"likes":"integer","website":"text","category":"enum"} - tools

{"id":"integer","created_at":"timestamp","title":"text","description":"text","likes":"integer","industry_id":"integer","projecttype_id":"integer","processstages_id":["integer"]} - toolkit

{"id":"integer","created_at":"timestamp","tools_id":"integer","comment":"text"} - toolcomments


{"id":"integer","created_at":"timestamp","toolkit_id":"integer","comment":"text"} - toolkilcomments

{"id":"integer","created_at":"timestamp","username":"text","password":"password"} - auth_tech

Below is the API for the database for all the tables and all the curd operations.

https://x8ki-letl-twmt.n7.xano.io/api:JQwL4HAE/auth_tech

https://x8ki-letl-twmt.n7.xano.io/api:JQwL4HAE/industry

https://x8ki-letl-twmt.n7.xano.io/api:JQwL4HAE/processstages

https://x8ki-letl-twmt.n7.xano.io/api:JQwL4HAE/projecttype

https://x8ki-letl-twmt.n7.xano.io/api:JQwL4HAE/substages

https://x8ki-letl-twmt.n7.xano.io/api:JQwL4HAE/toolcomments

https://x8ki-letl-twmt.n7.xano.io/api:JQwL4HAE/toolkilcomments

https://x8ki-letl-twmt.n7.xano.io/api:JQwL4HAE/toolkit

https://x8ki-letl-twmt.n7.xano.io/api:JQwL4HAE/tools


Finally the API that is getting the data required to display the toolkit.

https://x8ki-letl-twmt.n7.xano.io/api:JQwL4HAE/tookit_full

and here is the sameple response for the above API.

{"result1":[{"id":9,"created_at":1738972481995,"title":"Digital Payments Platform Implementation","description":"A fintech company wants to launch a digital payments platform that allows users to send, receive, and store money while ensuring security, compliance, and scalability. This project will walk through the real-world steps of developing and launching such a platform, highlighting the tools used in corporate environments at each stage.","likes":20,"industry_id":6,"projecttype_id":21,"processstages_id":[[{"id":21,"created_at":1738972577970,"name":"Platform Architecture Design","info":"Planning and designing the backend and frontend systems.","_substages_of_processstages":[{"id":32,"created_at":1738972711657,"processstages_id":21,"name":"API Development","description":"Building APIs for payments, user authentication, etc.","tools_id":[[{"id":42,"created_at":1738973126989,"name":"Postman","overview":"API calls, automation.","features":["API Calls","Automation"],"likes":0,"website":"postman.com","category":"Traditional","icon":{"access":"public","path":"/vault/_e-PIo3f/8o9uhMIwAR5AVEtKETQwYl5KJIQ/-50XfQ../postman-logo.png","name":"postman-logo.png","type":"image","size":45142,"mime":"image/png","meta":{"width":1384,"height":1244},"url":"https://x8ki-letl-twmt.n7.xano.io/vault/_e-PIo3f/8o9uhMIwAR5AVEtKETQwYl5KJIQ/-50XfQ../postman-logo.png"}}]]},{"id":31,"created_at":1738972710594,"processstages_id":21,"name":"Backend Architecture","description":"Choosing cloud infrastructure and database.","tools_id":[[{"id":41,"created_at":1738973122361,"name":"AWS","overview":"Scalable servers, storage.","features":["Scalabe Server","Storage"],"likes":0,"website":"aws.amazon.com","category":"Traditional","icon":{"access":"public","path":"/vault/_e-PIo3f/Kj_A7_e8eOmGrGlMTR8PlXWKp1Y/-KIOLA../AWS-Logo-svg.jpg","name":"AWS-Logo-svg.jpg","type":"image","size":53736,"mime":"image/jpeg","meta":{"width":1080,"height":1080},"url":"https://x8ki-letl-twmt.n7.xano.io/vault/_e-PIo3f/Kj_A7_e8eOmGrGlMTR8PlXWKp1Y/-KIOLA../AWS-Logo-svg.jpg"}}],[{"id":48,"created_at":1738973127416,"name":"Datadog","overview":"Logs, metrics, alerts.","features":["Logs, metrics, alerts"],"likes":0,"website":"datadoghq.com","category":"AI","icon":{"access":"public","path":"/vault/_e-PIo3f/peqOY8Zw5dgf0Rt54FrLNFLiuvA/ilYIYw../Datadog_logo.svg.webp","name":"Datadog_logo.svg.webp","type":"image","size":35680,"mime":"image/webp","meta":{"width":1200,"height":1200},"url":"https://x8ki-letl-twmt.n7.xano.io/vault/_e-PIo3f/peqOY8Zw5dgf0Rt54FrLNFLiuvA/ilYIYw../Datadog_logo.svg.webp"}}]]}]}],[{"id":22,"created_at":1738972613664,"name":"Compliance & Security Setup","info":"Implementing regulatory compliance, security, and fraud detection.","_substages_of_processstages":[{"id":33,"created_at":1738972712704,"processstages_id":22,"name":"Security Compliance","description":"Implementing KYC, AML, PCI DSS compliance.","tools_id":[[{"id":43,"created_at":1738973127080,"name":"Stripe","overview":"Supports cards, ACH.","features":["Support Cards","ACH"],"likes":0,"website":"stripe.com","category":"Traditional","icon":{"access":"public","path":"/vault/_e-PIo3f/sIGiyxAw2dA947M8OcILGVtPqCY/SFedgA../Stripe-Logo.png","name":"Stripe-Logo.png","type":"image","size":21662,"mime":"image/png","meta":{"width":3840,"height":2160},"url":"https://x8ki-letl-twmt.n7.xano.io/vault/_e-PIo3f/sIGiyxAw2dA947M8OcILGVtPqCY/SFedgA../Stripe-Logo.png"}}]]},{"id":34,"created_at":1738972713666,"processstages_id":22,"name":"Fraud Prevention","description":"Setting up AI-based fraud detection.","tools_id":[[{"id":44,"created_at":1738973127172,"name":"Firebase","overview":"Authentication, database.","features":["Authentication","Database"],"likes":0,"website":"firebase.google.com","category":"Traditional","icon":{"access":"public","path":"/vault/_e-PIo3f/brFo79Z9cYF4CL4D14G83apWV8U/oOqDlg../Firebase-Logo-Vector-scaled.jpg","name":"Firebase-Logo-Vector-scaled.jpg","type":"image","size":90791,"mime":"image/jpeg","meta":{"width":2560,"height":2560},"url":"https://x8ki-letl-twmt.n7.xano.io/vault/_e-PIo3f/brFo79Z9cYF4CL4D14G83apWV8U/oOqDlg../Firebase-Logo-Vector-scaled.jpg"}}]]}]}],[{"id":23,"created_at":1738972622663,"name":"Payment Gateway Integration","info":"Connecting third-party gateways for transactions.","_substages_of_processstages":[{"id":35,"created_at":1738972714448,"processstages_id":23,"name":"Gateway Selection","description":"Choosing Stripe, PayPal, or custom gateway.","tools_id":[[{"id":45,"created_at":1738973127266,"name":"Selenium","overview":"Web automation scripts.","features":["Web automation","Scripts"],"likes":0,"website":"selenium.dev","category":"Traditional","icon":{"access":"public","path":"/vault/_e-PIo3f/wD5cfLuniGdcgHOBwYu2rRDZUnE/3AxkEg../selenium-logo.png","name":"selenium-logo.png","type":"image","size":251701,"mime":"image/png","meta":{"width":1024,"height":1024},"url":"https://x8ki-letl-twmt.n7.xano.io/vault/_e-PIo3f/wD5cfLuniGdcgHOBwYu2rRDZUnE/3AxkEg../selenium-logo.png"}}]]}]}],[{"id":24,"created_at":1738972630815,"name":"Mobile & Web Development","info":"Developing the web and mobile interfaces for end-users.","_substages_of_processstages":[{"id":36,"created_at":1738972788064,"processstages_id":24,"name":"Web App Development","description":"Frontend development for web users.","tools_id":[[{"id":46,"created_at":1738973127337,"name":"ChatGPT API","overview":"NLP-based user support.","features":["NLP-based user support"],"likes":0,"website":"openai.com/api","category":"AI","icon":{"access":"public","path":"/vault/_e-PIo3f/riWvYIHcGIafiPftaSLosqcz1J0/FXQTDA../1681038628chatgpt-icon-logo.webp","name":"1681038628chatgpt-icon-logo.webp","type":"image","size":19466,"mime":"image/webp","meta":{"width":2000,"height":588},"url":"https://x8ki-letl-twmt.n7.xano.io/vault/_e-PIo3f/riWvYIHcGIafiPftaSLosqcz1J0/FXQTDA../1681038628chatgpt-icon-logo.webp"}}]]},{"id":37,"created_at":1738972792380,"processstages_id":24,"name":"Mobile App Development","description":"Native and hybrid mobile app development.","tools_id":[[{"id":45,"created_at":1738973127266,"name":"Selenium","overview":"Web automation scripts.","features":["Web automation","Scripts"],"likes":0,"website":"selenium.dev","category":"Traditional","icon":{"access":"public","path":"/vault/_e-PIo3f/wD5cfLuniGdcgHOBwYu2rRDZUnE/3AxkEg../selenium-logo.png","name":"selenium-logo.png","type":"image","size":251701,"mime":"image/png","meta":{"width":1024,"height":1024},"url":"https://x8ki-letl-twmt.n7.xano.io/vault/_e-PIo3f/wD5cfLuniGdcgHOBwYu2rRDZUnE/3AxkEg../selenium-logo.png"}}]]}]}],[{"id":25,"created_at":1738972639440,"name":"Testing & Deployment","info":"Conducting tests and launching the platform.","_substages_of_processstages":[{"id":38,"created_at":1738972793587,"processstages_id":25,"name":"Load Testing","description":"Performance and stress testing before launch.","tools_id":[[{"id":46,"created_at":1738973127337,"name":"ChatGPT API","overview":"NLP-based user support.","features":["NLP-based user support"],"likes":0,"website":"openai.com/api","category":"AI","icon":{"access":"public","path":"/vault/_e-PIo3f/riWvYIHcGIafiPftaSLosqcz1J0/FXQTDA../1681038628chatgpt-icon-logo.webp","name":"1681038628chatgpt-icon-logo.webp","type":"image","size":19466,"mime":"image/webp","meta":{"width":2000,"height":588},"url":"https://x8ki-letl-twmt.n7.xano.io/vault/_e-PIo3f/riWvYIHcGIafiPftaSLosqcz1J0/FXQTDA../1681038628chatgpt-icon-logo.webp"}}]]},{"id":39,"created_at":1738972809304,"processstages_id":25,"name":"Deployment","description":"Deploying to production with CI/CD pipelines.","tools_id":[[{"id":47,"created_at":1738973127373,"name":"Darktrace","overview":"Threat detection, response.","features":["Threat detection, response."],"likes":0,"website":"darktrace.com","category":"AI","icon":{"access":"public","path":"/vault/_e-PIo3f/uiEnpaCZVQT8uKPvWNZDqqFmO7o/SExeRQ../darktrace2762.jpg","name":"darktrace2762.jpg","type":"image","size":14504,"mime":"image/jpeg","meta":{"width":866,"height":650},"url":"https://x8ki-letl-twmt.n7.xano.io/vault/_e-PIo3f/uiEnpaCZVQT8uKPvWNZDqqFmO7o/SExeRQ../darktrace2762.jpg"}}],[{"id":41,"created_at":1738973122361,"name":"AWS","overview":"Scalable servers, storage.","features":["Scalabe Server","Storage"],"likes":0,"website":"aws.amazon.com","category":"Traditional","icon":{"access":"public","path":"/vault/_e-PIo3f/Kj_A7_e8eOmGrGlMTR8PlXWKp1Y/-KIOLA../AWS-Logo-svg.jpg","name":"AWS-Logo-svg.jpg","type":"image","size":53736,"mime":"image/jpeg","meta":{"width":1080,"height":1080},"url":"https://x8ki-letl-twmt.n7.xano.io/vault/_e-PIo3f/Kj_A7_e8eOmGrGlMTR8PlXWKp1Y/-KIOLA../AWS-Logo-svg.jpg"}}]]}]}]]}]}


There is no API for the posting the created toolkit


