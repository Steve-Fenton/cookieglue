# cookieglue

A working example of a re-usable framework for GDPR compliant cookie consent and script execution.

The basic premise is that you can write your own HTML for the consent management, with a couple of convention-based items being present.

Based on the names you use in the HTML consent management section, you can conditionally run or load scripts if consent has been given for them.

## Checklist

 - cookieglue.js script added synchronously early in the page
 - notice HTML added, with appropriate text in the appropriate language
 - manage HTML added, with the appropriate text in the appropriate language

## GDPR and CCPR

Please seek advice from your legal represenatives for the specific rules that apply to you for GDPR and CCPR regulations. They will help you to configure Cookie Glue correctly. Please refer to the Disclaimer of Warranty in the licence file. The software is free, so you can't expect it to be insurance backed. If you don't classify scripts appropriately, no amount of software will help you; so take great care at the classification stage.

Please also remember that neither GDPR or CCPR are actually about _cookies_; they are about an individual's right to privacy. That means the issue isn't _cookies_, the issue is what data you collect and store, and what you do with it. Terms like "cookie policy" are used by non-techncial people to refer to this broad issue, but that doesn't disclaim us from the regulations if we use an alternative technology. Local storage, remote storage, fingerprinting, and any other technique that allows you to store and use data that can be linked back to an individual is covered.

Neither the GDPR nor the values-based Charter of Fundamental Rights of the European Union are difficult reads. They are amongst the most plain-English regulations you are likely to find. It is worth reading them and understanding them.

Bear in mind that these regulations may have been enacted in a local regulation, such as the UK Data Protection Regulations. You will need to check for any differences in the local regulation. These are usually _not_ as easy to read as the EU regulations.

## Scripts

### Cookie Glue

You just need to include one synchronous script (it needs to be synchronous, because you don't know whether you can load other scripts without it - but it's small).

Include this script before all your other scripts

    <script src="/dist/cookieglue.js"></script>

### Checking Consent Before Loading Scripts

You can now ask Cookie Glue if you have the user's consent to load other scripts.

    if (CookieGlue.can('performance')) {
        // Google Analytics Script Here
    }

### Classifying Scripts

What's this "performance" string? We'll talk more about this shortly, but you can classify your scripts however you like. You can call them whatever you like. Here are some examples:

 - necessary: this would be scripts that you need in order to actually do the primary thing your website does
 - performance: this would be scripts that track anonymous usage of your website, but not anything that can be tied back to a user
 - tracking: this would be analytics that can be tied back to a user (even if it's just tied back by storing an id for that user in a cookie) - remarketing to a user and advertising based on profiling of a user are classes as tracking

 You decide the categories, and you establish the practice of classifying each script you add. You then load these scripts conditionally by checking with Cookie Glue first. You might need to audit what cookies, tracking, or profiling a script will result in for the user.

 ### Strict Mode vs Lax Mode

 Cookie Glue runs in Strict Mode by default. That means it won't drop _any_ scripts under it's control until the user has given consent. You can engage lax mode for a script by passing a default value to use if consent has not yet been given. If you have classified your scripts well, you may wish to do this for necessary scripts.

     if (CookieGlue.can('necessary'), true) {
        // Google Analytics Script Here
    }

Because we passed `true` in the above example, if consent has not yet been obtained, the script will run. When consent is collected later, and the consent is not given for a category, the script will no longer be run. Any cookies stored on the initial run will still be present. This is also true if a user later changes their preferences - it only applies to subsequent page loads.

Strict Mode helps you to ensure no cookies are stored until you have consent.

### HTML / UI

You need to supply two containers to handle user consent. This follows a well established pattern of user experience. Yes, the users are annoyed that they keep being asked these questions, but savvy users will require the ability to decide how their data is used.

We call the two pieces "notice" and "manage". The notice tells people that you collect and use data, which they can simply accept or choose to manage. If they choose to manage, you give them the ability to control additional purposes you intend to use.

The manage step reflects back those classifications you created earlier, so you'll give them some controls over what classifications, or _purposes_ they consent to.

#### Notice

The notice can be as simple as this... tell the user there is the intent to use additional purposes and give them an option to accept them all, or manage which of the purposes they want to accept.

    <article id="cg-notice" class="cookie-glue-container">
        <p>This website uses cookies and similar technologies to improve your online experience and to show tailored
            advertising to you.</p>
        <button class="cg-manage-opener">Manage</button> <button class="cg-accept">Accept</button>
        <p>You can view our <a href="#">privacy policy</a> for more information.</p>
    </article>

Recommendation: don't be tricky. A massive "ACCEPT" button and a tiny "MANAGE" button is going to cause you problems later on. Be transparent, use plain language, and give the options equal prominence.

The container id, "cg-notice", is required.

Use the class name "cg-manage-opener" for any link that you want to use to open the dialog to manage preferences.

Use the class name "cg-accept" for any link that you want to use to accept all purposes.

#### Manage

The manage dialog is only as complicated as the amount of additional processing you intent to apply. 

    <article id="cg-manage" class="cookie-glue-container">
        <h2>Cookie Preferences</h2>
        <ol>
            <li data-cookie-type="on-mandatory">
                <input type="checkbox" name="necessary" id="cb-necessary" />
                <h3><label for="cb-necessary">Necessary Cookies</label></h3>
                <p>Description.</p>
            </li>
            <li data-cookie-type="on-optional">
                <input type="checkbox" name="performance" id="cb-performance" />
                <h3><label for="cb-performance">Performance Cookies</label></h3>
                <p>Description.</p>
            </li>
            <li data-cookie-type="on-optional">
                <input type="checkbox" name="functionality" id="cb-functionality" />
                <h3><label for="cb-functionality">Functionality Cookies</label></h3>
                <p>Description.</p>
            </li>
            <li data-cookie-type="off-optional">
                <input type="checkbox" name="targeting" id="cb-targeting" />
                <h3><label for="cb-targeting">Targeting and Advertising Cookies</label></h3>
                <p>Description.</p>
            </li>
        </ol>

        <button class="cg-store">Save Preferences</button>
    </article>

The container id "cg-manage" is required.

There should be a list and each item should have a `data-cookie-type` of one of the following:

 - "on-mandatory" - these items cannot be switched off by the user as the website cannot function without them (but there shouldn't be any additional use of data and nothing that would affect the user's fundamental right to privacy)
 - "on-optional" - these items should be things like general analytics, that don't track specific users
 - "off-optional" - these items are user-specific, tracking, profiling, re-targeting and similar uses

 Within each list item there should be a single checkbox to store the preference. Cookie Glue will handle these checkboxes, so you don't need to add attributes to disable them or check / uncheck them. That will be taken care of.

 You can also add information to help the user understand the purpose behind the collection and use of the data, so they are giving consent that is specific and informed.

 There needs to be at least one element with the class name "cg-store". This will save the preferences, close the dialog, scroll to the top of the page, and reload it to allow any new purposes to execute.

 ## Asynchronous Content

 You may not want to load the HTML content on _every_ page just in case a user wants to manage preferences. That's okay, because you can load it when needed instead. This keeps your pages smaller as you haven't front-loaded all this cookie content _just in case_.

 If you specify a `data-cookie-source` on the container, the content from the specified URL will be loaded and the events bound to it when it is needed.

    <article id="cg-notice" class="cookie-glue-container" data-cookie-source="http://localhost:8080/en-GB/notice.txt">
    </article>

    <article id="cg-manage" class="cookie-glue-container"data-cookie-source="http://localhost:8080/en-GB/manage.txt">
    </article>

 ### Close Icons

 You can add close icons to the HTML dialogs. You just need to use the appropriate class name to make them act as the appropriate button, i.e. "cg-store" or "cg-accept".
