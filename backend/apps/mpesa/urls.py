from django.urls import path
from .views import STKCallbackView, B2CResultView, B2CTimeoutView

urlpatterns = [
    path('callback/',    STKCallbackView.as_view(), name='mpesa-stk-callback'),
    path('b2c/result/',  B2CResultView.as_view(),   name='mpesa-b2c-result'),
    path('b2c/timeout/', B2CTimeoutView.as_view(),  name='mpesa-b2c-timeout'),
]
