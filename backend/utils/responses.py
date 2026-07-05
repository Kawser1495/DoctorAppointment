from rest_framework.response import Response


def success_response(message, data=None):

    return Response({

        "success": True,

        "message": message,

        "data": data

    })


def error_response(message):

    return Response({

        "success": False,

        "message": message

    })