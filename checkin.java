    /**
     * Performs authentication on "ac2dm" service and match up android id,
     * security token and email by checking them in on this server.
     * 
     * This function sets check-inded android ID and that can be taken either by
     * using <code>getToken()</code> or from returned
     * {@link AndroidCheckinResponse} instance.
     * 
     */
    public AndroidCheckinResponse checkin() throws Exception {

    // this first checkin is for generating android-id
    AndroidCheckinResponse checkinResponse = postCheckin(Utils.generateAndroidCheckinRequest().toByteArray());
    this.setAndroidID(BigInteger.valueOf(checkinResponse.getAndroidId()).toString(16));
    setSecurityToken((BigInteger.valueOf(checkinResponse.getSecurityToken()).toString(16)));

    String c2dmAuth = loginAC2DM();

    AndroidCheckinRequest.Builder checkInbuilder = AndroidCheckinRequest.newBuilder(Utils.generateAndroidCheckinRequest());

    AndroidCheckinRequest build = checkInbuilder.setId(new BigInteger(this.getAndroidID(), 16).longValue())
        .setSecurityToken(new BigInteger(getSecurityToken(), 16).longValue()).addAccountCookie("[" + getEmail() + "]")
        .addAccountCookie(c2dmAuth).build();
    // this is the second checkin to match credentials with android-id
    return postCheckin(build.toByteArray());
    }
    /**
     * Posts given check-in request content and returns
     * {@link AndroidCheckinResponse}.
     */
    private AndroidCheckinResponse postCheckin(byte[] request) throws IOException {

    HttpEntity httpEntity = executePost(CHECKIN_URL, new ByteArrayEntity(request), new String[][] {
        { "User-Agent", "Android-Checkin/2.0 (generic JRO03E); gzip" }, { "Host", "android.clients.google.com" },
        { "Content-Type", "application/x-protobuffer" } });
    return AndroidCheckinResponse.parseFrom(httpEntity.getContent());
    }    

/**
     * Generates android checkin request with properties of "Galaxy S3".
     * 
     * <a href=
     * "http://www.glbenchmark.com/phonedetails.jsp?benchmark=glpro25&D=Samsung+GT-I9300+Galaxy+S+III&testgroup=system"
     * > http://www.glbenchmark.com/phonedetails.jsp?benchmark=glpro25&D=Samsung
     * +GT-I9300+Galaxy+S+III&testgroup=system </a>
     */
    public static AndroidCheckinRequest generateAndroidCheckinRequest() {

    return AndroidCheckinRequest
        .newBuilder()
        .setId(0)
        .setCheckin(
            AndroidCheckinProto
                .newBuilder()
                .setBuild(
                    AndroidBuildProto.newBuilder()
                        .setId("samsung/m0xx/m0:4.0.4/IMM76D/I9300XXALF2:user/release-keys")
                        .setProduct("smdk4x12").setCarrier("Google").setRadio("I9300XXALF2")
                        .setBootloader("PRIMELA03").setClient("android-google")
                        .setTimestamp(new Date().getTime() / 1000).setGoogleServices(16).setDevice("m0")
                        .setSdkVersion(16).setModel("GT-I9300").setManufacturer("Samsung")
                        .setBuildProduct("m0xx").setOtaInstalled(false)).setLastCheckinMsec(0)
                .setCellOperator("310260").setSimOperator("310260").setRoaming("mobile-notroaming")
                .setUserNumber(0)).setLocale("en_US").setTimeZone("Europe/Istanbul").setVersion(3)
        .setDeviceConfiguration(getDeviceConfigurationProto()).setFragment(0).build();
    }
